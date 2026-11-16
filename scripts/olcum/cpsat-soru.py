"""One CP-SAT question, answered the way src-tauri/src/cpsat.rs answers it.

    python cpsat-soru.py <ortools.dll | libortools.9.dylib> <folder>

<folder> holds params.bin and model.bin (what the page would send); this writes
answer.bin there and prints one line, "OLCUM {json}": the call's wall time, the
peak working set of this process and its CPU affinity. CP-SAT's own log goes to
stdout as well (log_search_progress is added to the page's params), and the
caller reads the time of the first solution from it.

The same C functions as cpsat.rs, through ctypes, from the same pinned OR-Tools
release: no Python package, no second CP-SAT. Measurement only (the workflow
olcum-iki-cekirdek.yml); nothing ships it.

MOZAIK_OLCUM_MASK (Windows): an affinity mask this process sets on itself
before the library loads, so the search's threads stay inside it even if the
parent's mask was not inherited.
"""

import ctypes
import json
import os
import sys
import time

WINDOWS = os.name == "nt"


def peak_mb():
    if WINDOWS:

        class Counters(ctypes.Structure):
            _fields_ = [
                ("cb", ctypes.c_uint32),
                ("PageFaultCount", ctypes.c_uint32),
                ("PeakWorkingSetSize", ctypes.c_size_t),
                ("WorkingSetSize", ctypes.c_size_t),
                ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                ("PagefileUsage", ctypes.c_size_t),
                ("PeakPagefileUsage", ctypes.c_size_t),
            ]

        c = Counters()
        c.cb = ctypes.sizeof(c)
        k32 = ctypes.windll.kernel32
        k32.GetCurrentProcess.restype = ctypes.c_void_p
        k32.K32GetProcessMemoryInfo.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32]
        k32.K32GetProcessMemoryInfo(k32.GetCurrentProcess(), ctypes.byref(c), c.cb)
        return c.PeakWorkingSetSize / 2**20
    import resource

    rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return rss / 2**20 if sys.platform == "darwin" else rss / 1024


def affinity():
    if not WINDOWS:
        return None
    k32 = ctypes.windll.kernel32
    k32.GetCurrentProcess.restype = ctypes.c_void_p
    k32.GetProcessAffinityMask.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]
    k32.SetProcessAffinityMask.argtypes = [ctypes.c_void_p, ctypes.c_size_t]
    me = k32.GetCurrentProcess()
    mask = os.environ.get("MOZAIK_OLCUM_MASK", "")
    if mask:
        k32.SetProcessAffinityMask(me, int(mask, 0))
    p, s = ctypes.c_size_t(), ctypes.c_size_t()
    k32.GetProcessAffinityMask(me, ctypes.byref(p), ctypes.byref(s))
    return {"process": p.value, "system": s.value}


def main():
    lib_path, folder = sys.argv[1], sys.argv[2]
    mask = affinity()
    with open(os.path.join(folder, "params.bin"), "rb") as f:
        # SatParameters.log_search_progress (field 41) = true, appended: protobuf
        # reads a scalar field given twice as the last one.
        params = f.read() + bytes([0xC8, 0x02, 0x01])
    with open(os.path.join(folder, "model.bin"), "rb") as f:
        model = f.read()

    if WINDOWS:
        os.add_dll_directory(os.path.dirname(os.path.abspath(lib_path)))
    lib = ctypes.CDLL(os.path.abspath(lib_path))
    lib.SolveCpNewEnv.restype = ctypes.c_void_p
    lib.SolveCpDestroyEnv.argtypes = [ctypes.c_void_p]
    lib.SolveCpInterruptible.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_int,
        ctypes.c_char_p,
        ctypes.c_int,
        ctypes.POINTER(ctypes.c_void_p),
        ctypes.POINTER(ctypes.c_int),
    ]
    loaded_mb = peak_mb()

    env = lib.SolveCpNewEnv()
    res, res_len = ctypes.c_void_p(), ctypes.c_int(0)
    t0 = time.perf_counter()
    lib.SolveCpInterruptible(
        env, model, len(model), params, len(params), ctypes.byref(res), ctypes.byref(res_len)
    )
    wall = time.perf_counter() - t0
    lib.SolveCpDestroyEnv(env)
    if not res.value or res_len.value < 0:
        raise SystemExit("CP-SAT bir cevap vermedi")
    with open(os.path.join(folder, "answer.bin"), "wb") as f:
        f.write(ctypes.string_at(res.value, res_len.value))
    # The response is the library's malloc; the process ends here, so it is not freed.
    line = {"wallS": wall, "loadedMb": loaded_mb, "peakMb": peak_mb(), "affinity": mask}
    print("OLCUM " + json.dumps(line), flush=True)


main()
