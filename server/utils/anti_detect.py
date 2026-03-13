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

// Realistic plugins
Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
});

// Realistic languages
Object.defineProperty(navigator, 'languages', {
    get: () => ['zh-CN', 'zh', 'en-US', 'en'],
});

// Chrome runtime
window.chrome = { runtime: {} };

// Permissions
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) =>
    parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
"""
