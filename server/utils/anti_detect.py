import asyncio
import random


async def human_delay(min_s=0.5, max_s=2.0):
    await asyncio.sleep(random.uniform(min_s, max_s))


async def typing_delay():
    await asyncio.sleep(random.uniform(0.045, 0.095))


async def short_delay():
    await asyncio.sleep(random.uniform(0.3, 0.8))


def jitter(base_s, ratio=0.25):
    return base_s + random.uniform(-base_s * ratio, base_s * ratio)


STEALTH_JS = """
// Remove webdriver flag
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
delete navigator.__proto__.webdriver;

// Override navigator.plugins with realistic data
Object.defineProperty(navigator, 'plugins', {
    get: () => {
        const p = {
            0: {type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: null},
            length: 1,
            'Chrome PDF Plugin': {type: 'application/x-google-chrome-pdf', suffixes: 'pdf'},
        };
        p[0].__proto__ = Plugin.prototype;
        return p;
    },
});

// Realistic languages
Object.defineProperty(navigator, 'languages', {
    get: () => ['zh-CN', 'zh', 'en-US', 'en'],
});

// Platform
Object.defineProperty(navigator, 'platform', {
    get: () => 'Win32',
});

// Hardware concurrency
Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8,
});

// Device memory
Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 8,
});

// Chrome runtime
window.chrome = {
    runtime: {
        PlatformOs: {MAC: 'mac', WIN: 'win', ANDROID: 'android', CROS: 'cros', LINUX: 'linux', OPENBSD: 'openbsd'},
        PlatformArch: {ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64', MIPS: 'mips', MIPS64: 'mips64'},
        PlatformNaclArch: {ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64', MIPS: 'mips', MIPS64: 'mips64'},
        RequestUpdateCheckStatus: {THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available'},
        OnInstalledReason: {INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update'},
        OnRestartRequiredReason: {APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic'},
        connect: function() {},
        sendMessage: function() {},
    },
    csi: function() { return {}; },
    loadTimes: function() { return {}; },
};

// Permissions
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) =>
    parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);

// WebGL vendor/renderer
const getParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return 'Google Inc. (NVIDIA)';
    if (parameter === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11)';
    return getParameter.call(this, parameter);
};

// Prevent iframe contentWindow detection
try {
    const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', {
        ...elementDescriptor,
        get: function() { if (this.id === 'modernizr') return 1; return elementDescriptor.get.apply(this); },
    });
} catch(e) {}

// Fix toString for overridden functions
const nativeToString = Function.prototype.toString;
const proxyHandler = {
    apply: function(target, thisArg, args) {
        return nativeToString.apply(thisArg, args).replace('function () { [native code] }', 'function () { [native code] }');
    }
};
"""
