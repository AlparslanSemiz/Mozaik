// Step: the classes. A class is a closed set of students, so two classes never
// clash with each other — only through a shared room.

import { useMemo, useState } from "react";
import ListTools from "../common/ListTools";
import { useRowOrder } from "../common/useRowOrder";
import {
  applyList,
  byNumberThen,
  compareTr,
  EMPTY_QUERY,
} from "../../listview";
import type { ListConfig, ListQuery } from "../../listview";
import { roomName } from "../../entities";
import type { ClassGroup } from "../../types";
import { PanelRight } from "lucide-react";
import { useInspect } from "../overlay/Inspector";
import { useDialogs } from "../overlay/Dialogs";
import { parseClasses } from "../../import";
import ColorPick from "../common/ColorPick";
import {
  addClass,
  addClassesFromRows,
  deleteClass,
  deletionQuestion,
  updateClass,
  weeklyLoad,
} from "../../entities";
import LimitBox from "../common/LimitBox";
import Paste from "./Paste";
import type { PanelProps } from "../common/props";
import { T, useT } from "../T";
import AddPanel from "../common/AddPanel";
import { buildCapacity } from "../../feasibility";
import { loadStatusFacet } from "./loadStatusFacet";

export default function Classes({ state, change }: PanelProps) {
  const t = useT();
  const { confirm } = useDialogs();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  const listCfg = useMemo<ListConfig<ClassGroup>>(() => {
    const capacity = buildCapacity(state);
    return {
      haystack: (c) => `${c.name} ${roomName(state, c.roomId)}`,
      // Grouping classes by the room they share is the one grouping this
      // screen can offer that Kontrol cannot: it is what makes a room's load
      // legible before it becomes a clash.
      facets: [
        {
          id: "derslik",
          label: t("Derslik"),
          of: (c) => (c.roomId === null ? "" : roomName(state, c.roomId)),
        },
        loadStatusFacet<ClassGroup>(capacity.classes, t),
      ],
      sorts: [
        {
          id: "ad",
          label: t("Ada göre"),
          cmp: (a, b) => compareTr(a.name, b.name),
        },
        {
          id: "derslik",
          label: t("Dersliğe göre"),
          cmp: (a, b) =>
            compareTr(roomName(state, a.roomId), roomName(state, b.roomId)) ||
            compareTr(a.name, b.name),
        },
        {
          id: "yuk",
          label: t("Ders yüküne göre"),
          cmp: byNumberThen(
            (c) => weeklyLoad(state, "class", c.id),
            (c) => c.name,
          ),
        },
      ],
    };
  }, [state, t]);
  const shown = applyList(state.classes, query, listCfg);
  const order = useRowOrder({
    kind: "classes",
    count: state.classes.length,
    query,
    change,
  });
  const [newClass, setNewClass] = useState({ name: "", roomId: "" });
  const [pasteOpen, setPasteOpen] = useState(false);
  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  // Enter adds, the way it does in Derslikler and Branşlar. Entering twenty
  // classes is twenty trips to a button otherwise, and the room stays picked
  // because it is usually the same one twice in a row.
  function addNew() {
    if (newClass.name.trim() === "") return;
    change((d) => addClass(d, newClass.name, newClass.roomId || null));
    setNewClass({ name: "", roomId: newClass.roomId });
  }

  return (
    <>
      {/* ADDING IS ITS OWN BLOCK — not a rule drawn across one panel.
          ("Listelerde ekleme kısmı ayrı blok olsun. aynı özetin ayrı blok
           olduğu gibi, yani sadece çizgi olmasın.")

          A line says where something ends; a panel says the two are
          different things. Nothing moved: the form is still above the list.
          The COUNTED heading went with the list it counts, and this one
          names the work — so the screen still has exactly one --fs-xl
          heading, and it is the one over the rows being read.

          The paste button rides the HEADING, not the form row: "Excel'den
          yapıştır o bloğun en sağında hatta en sağ üstünde bile olabilir."
          All five panels put it in the same corner. */}
      <AddPanel
        title={t("Yeni sınıf")}
        action={
          <button className="btn" onClick={() => setPasteOpen(true)}>
            {t("Excel'den yapıştır")}
          </button>
        }
        description={
          <T k="Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit odasıdır." />
        }
        more={t(
          "Derslik yerleştirirken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.",
        )}
      >
        <div className="form-row">
          <input
            type="text"
            placeholder={t("Sınıf adı, örn. 510")}
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNew();
            }}
          />
          <select
            value={newClass.roomId}
            onChange={(e) =>
              setNewClass({ ...newClass, roomId: e.target.value })
            }
          >
            <option value="">{t("Derslik yok")}</option>
            {state.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            className="btn"
            disabled={newClass.name.trim() === ""}
            onClick={addNew}
          >
            {t("Ekle")}
          </button>
        </div>

        <Paste
          open={pasteOpen}
          close={() => setPasteOpen(false)}
          title={t("Sınıfları yapıştır")}
          example={t("Sınıf adı · Derslik adı")}
          parse={parseClasses}
          rowText={(x) =>
            x.roomName
              ? t("{ad} → {derslik} dersliği", {
                  ad: x.name,
                  derslik: x.roomName,
                })
              : x.name
          }
          onAdd={(rows) => change((d) => addClassesFromRows(d, rows))}
        />
      </AddPanel>

      <div className="panel step-panel">
        <h2>{t("Sınıflar ({n})", { n: state.classes.length })}</h2>

        {state.classes.length > 0 && (
          <ListTools
            items={state.classes}
            query={query}
            setQuery={setQuery}
            config={listCfg}
            shown={shown.length}
            noun="sınıf"
            countKey="{n} sınıf"
            notice={order.notice}
          />
        )}

        {state.classes.length > 0 && shown.length === 0 && (
          <p className="hint">{t("Bu aramaya uyan sınıf yok.")}</p>
        )}

        {/* Eleven columns do not fit a 100 %-wide table at --ui-scale
            1.5: the browser answers by crushing whichever column can
            still shrink, and at 150 % that was the NAME — 232 px down
            to 26 px, measured. Wide content scrolls in its own box
            rather than squeezing the reader's own words out. */}
        {shown.length > 0 && (
          <div className="table-scroll">
            <table className="list">
              <thead>
                <tr>
                  {order.head}
                  <th className="w-col-xs">{t("Renk")}</th>
                  <th className="w-col-xl">{t("Ad")}</th>
                  {/* Narrower than the name beside it, and that is the point: a
                    room is a letter, not a name. The box still has to hold its
                    longest OPTION ("Derslik yok"), which is what --w-col-lg
                    clears — the width is on the <th> because a <select> at
                    `width: 100%` contributes nothing to max-content (pitfall
                    34). */}
                  <th className="w-col-lg">{t("Derslik")}</th>
                  <th className="w-col-sm">{t("Ders saati")}</th>
                  {/* The class's own daily limit — the middle of the three
                    layers. Same box and the same "empty means the school's
                    number" contract as the three on the teacher list. */}
                  <th
                    className="w-col-md"
                    title={t(
                      "Bu sınıf bir günde aynı dersten en fazla kaç saat",
                    )}
                  >
                    {t("Günde aynı ders ↑")}
                  </th>
                  <th className="w-col-md" />
                </tr>
              </thead>
              <tbody ref={order.bodyRef}>
                {shown.map((c, i) => (
                  <tr key={c.id} data-row-name={c.name}>
                    {order.grip(i, c.name)}
                    <td>
                      <ColorPick
                        value={c.color}
                        owner={c.name}
                        onChange={(next) =>
                          change((d) => updateClass(d, c.id, { color: next }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={c.name}
                        onBlur={(e) =>
                          change((d) =>
                            updateClass(d, c.id, {
                              name: e.target.value.trim(),
                            }),
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={c.roomId ?? ""}
                        aria-label={t("{ad} dersliği", { ad: c.name })}
                        onChange={(e) =>
                          change((d) =>
                            updateClass(d, c.id, {
                              roomId: e.target.value || null,
                            }),
                          )
                        }
                      >
                        <option value="">{t("Derslik yok")}</option>
                        {state.rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {weeklyLoad(state, "class", c.id)}
                      {" / "}
                      {dayCount * hourCount}
                    </td>
                    <td>
                      <LimitBox
                        value={c.maxSameLessonPerDay}
                        fallback={state.settings.limits.maxSameLessonPerDay}
                        title={t(
                          "{ad} bir günde aynı dersten en fazla kaç saat",
                          { ad: c.name },
                        )}
                        onSet={(v) =>
                          change((d) =>
                            updateClass(d, c.id, { maxSameLessonPerDay: v }),
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="form-row nowrap">
                        {/* Its whole week, its load and what it is tied to, without
                        leaving the list. The information was always there; it
                        was spread over four tabs. */}
                        <button
                          className="btn icon"
                          aria-label={`${c.name} bilgileri`}
                          title={t("Bilgileri ve haftalık programı")}
                          onClick={() => inspect("class", c.id)}
                        >
                          <PanelRight size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="btn danger"
                          onClick={async () => {
                            const q = deletionQuestion(state, "class", c.id);
                            if (
                              !(await confirm({
                                title: q.title,
                                body: q.cost,
                                confirmLabel: "Sil",
                                danger: true,
                              }))
                            )
                              return;
                            change((d) => deleteClass(d, c.id));
                          }}
                        >
                          {t("Sil")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
