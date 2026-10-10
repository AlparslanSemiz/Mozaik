// One printed timetable, drawn from its model (`pure/paper`): the title, the
// header of lesson numbers, a row per day, and the stamp. It decides nothing
// about what the sheet says; `Print` chooses which sheets there are.

import { paletteColor } from '../../leaf/palette';
import type { Sheet as SheetModel, SheetHour } from '../../pure/paper';
import { useT } from '../T';

interface Props {
  sheet: SheetModel;
  head: SheetHour[];
  colored: boolean;
  /** "… tarihinde yazdırıldı", or null when the stamp is off. */
  stamped: string | null;
}

export default function Sheet({ sheet, head, colored, stamped }: Props) {
  const t = useT();
  return (
    <div className="print-page">
      <h3>
        {/* Big line: what the sheet is. Small line: whose it is. The two used
            to be one long left-aligned string, which on paper read as a
            caption rather than a title. */}
        <span className="p-title-main">
          {colored && <span className="p-dot" style={{ background: paletteColor(sheet.color) }} />}
          {sheet.title}
        </span>
        {sheet.sub === '' ? null : <span className="p-title-sub">{sheet.sub}</span>}
      </h3>
      <table className="print">
        <thead>
          <tr>
            <th className="p-daycol">{t('Gün')}</th>
            {head.map((hour, s) => (
              <th key={s}>
                {hour.label}
                {hour.clock.map((g, i) => (
                  <span className="p-clock" key={i}>
                    {g.days !== null && <span className="p-clock-days">{g.days} </span>}
                    {g.start}–{g.end}
                  </span>
                ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.days.map((day, g) => (
            <tr key={g}>
              <th className="p-daycol">{day.label}</th>
              {day.cells.map((cell, i) => (
                <td
                  key={i}
                  colSpan={cell.span > 1 ? cell.span : undefined}
                  className={cell.breakAfter ? 'p-break' : ''}
                  style={
                    colored && cell.color !== null
                      ? { background: paletteColor(cell.color) }
                      : undefined
                  }
                >
                  {cell.top !== null && (
                    <>
                      <span className="p-top">{cell.top}</span>
                      {cell.bottom !== null && <span className="p-bottom">{cell.bottom}</span>}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Last child of the page box, so `justify-content: safe center` centres
          the plan WITH it rather than around it. */}
      {stamped !== null && <div className="p-stamp">{stamped} tarihinde yazdırıldı</div>}
    </div>
  );
}
