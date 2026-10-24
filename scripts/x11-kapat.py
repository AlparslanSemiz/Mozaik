# Sends WM_DELETE_WINDOW to every X11 window named "Mozaik": the message a
# window manager sends when the title bar's X is clicked, and the one road to
# Tauri's CloseRequested that a test can take (WebDriver's "close window"
# destroys the webview without it, TB7). ctypes only, nothing to install.
# Called by scripts/pencere-kapat.mjs; prints how many windows it told.
#   python3 -I scripts/x11-kapat.py [ad]
import ctypes, ctypes.util, sys

ad = (sys.argv[1] if len(sys.argv) > 1 else "Mozaik").encode()
x = ctypes.cdll.LoadLibrary(ctypes.util.find_library("X11"))
x.XOpenDisplay.restype = ctypes.c_void_p
x.XDefaultRootWindow.restype = ctypes.c_ulong
x.XDefaultRootWindow.argtypes = [ctypes.c_void_p]
x.XInternAtom.restype = ctypes.c_ulong
x.XInternAtom.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
x.XQueryTree.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.POINTER(ctypes.c_ulong),
                         ctypes.POINTER(ctypes.c_ulong), ctypes.POINTER(ctypes.POINTER(ctypes.c_ulong)),
                         ctypes.POINTER(ctypes.c_uint)]
x.XFetchName.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.POINTER(ctypes.c_char_p)]
x.XSendEvent.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_int, ctypes.c_long, ctypes.c_void_p]
x.XFlush.argtypes = [ctypes.c_void_p]

class ClientMessage(ctypes.Structure):
    _fields_ = [("type", ctypes.c_int), ("serial", ctypes.c_ulong), ("send_event", ctypes.c_int),
                ("display", ctypes.c_void_p), ("window", ctypes.c_ulong), ("message_type", ctypes.c_ulong),
                ("format", ctypes.c_int), ("l", ctypes.c_long * 5)]

class XEvent(ctypes.Union):
    _fields_ = [("xclient", ClientMessage), ("pad", ctypes.c_long * 24)]

d = x.XOpenDisplay(None)
if not d:
    sys.exit("X ekranı yok")
protocols = x.XInternAtom(d, b"WM_PROTOCOLS", 0)
delete = x.XInternAtom(d, b"WM_DELETE_WINDOW", 0)

def windows(w):
    root, parent = ctypes.c_ulong(), ctypes.c_ulong()
    children, n = ctypes.POINTER(ctypes.c_ulong)(), ctypes.c_uint()
    if not x.XQueryTree(d, w, ctypes.byref(root), ctypes.byref(parent), ctypes.byref(children), ctypes.byref(n)):
        return
    for i in range(n.value):
        c = children[i]
        yield c
        yield from windows(c)

sent = 0
for w in windows(x.XDefaultRootWindow(d)):
    name = ctypes.c_char_p()
    if x.XFetchName(d, w, ctypes.byref(name)) and name.value == ad:
        ev = XEvent()
        ev.xclient.type = 33  # ClientMessage
        ev.xclient.window = w
        ev.xclient.message_type = protocols
        ev.xclient.format = 32
        ev.xclient.l[0] = delete
        x.XSendEvent(d, w, 0, 0, ctypes.byref(ev))
        sent += 1
x.XFlush(d)
print(f"gönderildi: {sent}")
