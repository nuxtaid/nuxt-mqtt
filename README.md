![nuxt-mqtt](https://raw.githubusercontent.com/arashsheyda/nuxt-mqtt/refs/heads/main/playground/public/logo.png)

# nuxt-mqtt

SSR-safe MQTT integration for Nuxt 3 using [mqtt.js](https://github.com/mqttjs/MQTT.js), with runtime config support and a simple composable API.

## Features

- **SSR-safe** — the MQTT client only runs on the client side, so your app renders correctly on the server
- **One global connection** — a single MQTT client is shared across your entire app via a Nuxt plugin
- **Simple composable API** — `useMQTT()` gives you `publish()` and `subscribe()` out of the box
- **Runtime config support** — configure the broker URL and options via `nuxt.config.ts` or environment variables
- **Auto-imported** — `useMQTT()` is auto-imported, no manual imports needed
- **Ideal for IoT** — works great with ESP32, Raspberry Pi, smart home dashboards, and any MQTT-based project

---

## Quick Start

### 1. Install the module

```bash
# pnpm
pnpm add nuxt-mqtt

# npm
npm install nuxt-mqtt

# yarn
yarn add nuxt-mqtt
```

### 2. Add it to your Nuxt config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-mqtt'],

  mqtt: {
    url: 'ws://localhost:9001', // Required — your MQTT broker WebSocket URL
  },
})
```

> **Important:** The `url` must be a **WebSocket** URL (`ws://` or `wss://`), because the MQTT client runs in the browser. Standard MQTT ports (e.g. `mqtt://localhost:1883`) will **not** work in the browser.

### 3. Use it in your components

```vue
<template>
  <div>
    <p>Temperature: {{ temperature }}°C</p>
    <button @click="toggleLight">Toggle Light</button>
  </div>
</template>

<script setup lang="ts">
const temperature = ref('--')
const { publish, subscribe } = useMQTT()

// Subscribe to a topic — the callback fires every time a message arrives
subscribe('home/livingroom/temp', (msg) => {
  temperature.value = msg
})

// Publish a message (string or object)
function toggleLight() {
  publish('home/livingroom/light/set', { state: 'toggle' })
}
</script>
```

That's it! No imports needed — `useMQTT()` is auto-imported by the module.

---

## API Reference

### `useMQTT()`

Returns an object with two methods:

#### `publish(topic, message)`

Sends a message to the given MQTT topic.

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | `string` | The MQTT topic to publish to (e.g. `'home/light/set'`) |
| `message` | `string \| object` | The payload. Objects are automatically serialized to JSON |

```ts
const { publish } = useMQTT()

// Send a string
publish('home/light/set', 'on')

// Send an object (auto-serialized to JSON)
publish('home/blinds/set', { position: 50 })
```

#### `subscribe(topic, callback)`

Subscribes to an MQTT topic and calls the callback whenever a message is received. Returns an **unsubscribe function** that you should call to clean up when the component is unmounted.

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | `string` | The MQTT topic to subscribe to |
| `callback` | `(message: string) => void` | Called with the message payload as a string |

**Returns:** `() => void` — a cleanup function that removes the listener

```ts
const { subscribe } = useMQTT()

// Basic usage
subscribe('home/livingroom/temp', (msg) => {
  console.log('Temperature:', msg)
})

// With cleanup (recommended)
const unsubscribe = subscribe('home/livingroom/temp', (msg) => {
  console.log('Temperature:', msg)
})

onUnmounted(() => {
  unsubscribe()
})
```

---

## Configuration

All configuration goes under the `mqtt` key in `nuxt.config.ts`. The module accepts all [mqtt.js client options](https://github.com/mqttjs/MQTT.js#client) plus the required `url` field.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-mqtt'],

  mqtt: {
    // Required
    url: 'ws://localhost:9001',

    // Optional — all mqtt.js options are supported
    clientId: 'my_nuxt_app',       // defaults to 'nuxt_' + random hex
    clean: true,                    // default: true
    connectTimeout: 4000,           // default: 4000 (ms)
    reconnectPeriod: 1000,          // default: 1000 (ms)

    // Authentication (if your broker requires it)
    username: 'my_user',
    password: 'my_password',
  },
})
```

### Using Environment Variables

You can use environment variables to avoid hardcoding credentials. Since the module uses `runtimeConfig.public.mqtt`, you can override values with `NUXT_PUBLIC_MQTT_*` env vars:

```bash
NUXT_PUBLIC_MQTT_URL=wss://broker.example.com:8084
NUXT_PUBLIC_MQTT_USERNAME=my_user
NUXT_PUBLIC_MQTT_PASSWORD=my_password
```

> **Note:** Since the MQTT configuration is under `runtimeConfig.public`, it is exposed to the browser. Do not put secrets here unless you are using a private/internal network. For private brokers requiring secure credentials, consider proxying through your server.

### Common Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | — | **Required.** WebSocket URL of your MQTT broker |
| `clientId` | `string` | `'nuxt_' + random` | Unique client identifier |
| `clean` | `boolean` | `true` | Start a clean session on connect |
| `connectTimeout` | `number` | `4000` | Connection timeout in milliseconds |
| `reconnectPeriod` | `number` | `1000` | Reconnection interval in milliseconds |
| `username` | `string` | — | Broker username |
| `password` | `string` | — | Broker password |

For the full list of options, see the [mqtt.js documentation](https://github.com/mqttjs/MQTT.js#client).

---

## Full Example: Smart Home Dashboard

```vue
<template>
  <div>
    <h2>Living Room</h2>
    <p>Temperature: {{ temperature }}°C</p>
    <p>Humidity: {{ humidity }}%</p>
    <p>Light: {{ lightState }}</p>
    <button @click="toggleLight">Toggle Light</button>

    <h2>Blinds</h2>
    <input type="range" min="0" max="100" v-model="blindsPosition" @change="setBlinds" />
    <p>Position: {{ blindsPosition }}%</p>
  </div>
</template>

<script setup lang="ts">
const temperature = ref('--')
const humidity = ref('--')
const lightState = ref('off')
const blindsPosition = ref(0)

const { publish, subscribe } = useMQTT()

// Subscribe to multiple topics
subscribe('home/livingroom/temp', (msg) => {
  temperature.value = msg
})

subscribe('home/livingroom/humidity', (msg) => {
  humidity.value = msg
})

subscribe('home/livingroom/light/state', (msg) => {
  lightState.value = msg
})

subscribe('home/livingroom/blinds/state', (msg) => {
  blindsPosition.value = Number(msg)
})

// Publish commands
function toggleLight() {
  const newState = lightState.value === 'on' ? 'off' : 'on'
  publish('home/livingroom/light/set', newState)
}

function setBlinds() {
  publish('home/livingroom/blinds/set', { position: blindsPosition.value })
}
</script>
```

---

## Setting Up an MQTT Broker (for testing)

If you don't have an MQTT broker yet, the easiest way to get started is with [Mosquitto](https://mosquitto.org/):

### Using Docker

```bash
docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto
```

You may need a `mosquitto.conf` that enables the WebSocket listener:

```
listener 1883
listener 9001
protocol websockets
allow_anonymous true
```

```bash
docker run -it -p 1883:1883 -p 9001:9001 \
  -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

### Using Homebrew (macOS)

```bash
brew install mosquitto
# Edit /opt/homebrew/etc/mosquitto/mosquitto.conf to add WebSocket listener
# Then start with:
brew services start mosquitto
```

### Public Test Brokers

For quick testing without setting up your own broker:

```ts
mqtt: {
  url: 'wss://test.mosquitto.org:8081',
}
```

> **Warning:** Public brokers are shared — do not send sensitive data.

---

## How It Works

1. **Module setup** — when Nuxt builds your app, the module reads the `mqtt` config and stores it in `runtimeConfig.public.mqtt`
2. **Client plugin** — on the client side only (`.client.ts` plugin), an MQTT connection is established using `mqtt.connect()` and provided globally as `$mqtt` via Nuxt's plugin system
3. **Composable** — `useMQTT()` accesses the `$mqtt` client from the Nuxt app context and wraps it with convenient `publish()` and `subscribe()` methods
4. **SSR-safe** — on the server, the plugin doesn't run, so there is no MQTT connection during SSR. The composable should only be called in client-side lifecycle hooks or in components

---

## Troubleshooting

### "MQTT broker URL is not defined"
Make sure you have set the `url` in your `mqtt` config in `nuxt.config.ts`. The URL is required.

### Connection fails silently
- Verify your broker is running and accessible
- Make sure you're using a **WebSocket** URL (`ws://` or `wss://`), not a plain MQTT URL (`mqtt://`)
- Check the browser console for MQTT connection/error logs (the module logs `✅ MQTT connected`, `🔄 MQTT reconnecting`, and `❌ MQTT error`)

### Messages not arriving
- Make sure the topic string matches exactly (MQTT topics are case-sensitive)
- Verify your broker allows the subscription (check ACLs)
- Open the browser console to confirm the connection is established

### Using with authentication
```ts
mqtt: {
  url: 'wss://broker.example.com:8084',
  username: 'my_user',
  password: 'my_password',
}
```

---

## License

[MIT](./LICENSE)
