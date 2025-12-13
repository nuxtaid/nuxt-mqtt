![nuxt-mqtt](https://raw.githubusercontent.com/arashsheyda/nuxt-mqtt/refs/heads/main/playground/public/logo.png)

# nuxt-mqtt

SSR-safe MQTT integration for Nuxt 3 using mqtt.js, with runtime config support and a simple composable API.

## Features

- SSR-safe MQTT integration
- One global MQTT connection
- Easy `publish` and `subscribe` composables
- Runtime config support for MQTT broker URL and options
- Ideal for IoT, ESP32 projects, smart home dashboards

## Installation

```bash
pnpm add nuxt-mqtt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-mqtt',
  ],
  mqtt: {
    url: 'ws://localhost:9001', // your MQTT broker URL
    clientId: 'my_nuxt_client', // optional
    ...otherOptions // other mqtt.js options
  },
})
```

## Usage

### Composable API

```ts
<script setup lang="ts">
const { publish, subscribe } = useMQTT()

subscribe('home/blinds/state', msg => {
  console.log('Blinds state:', msg)
})

publish('home/blinds/set', { position: 50 })
</script>
```

### Topics Structure (example)
```
home/
  livingroom/
    temp
    light
    blinds/set
    blinds/state
  bedroom/
    light
```

ESP32 or other IoT devices can publish/subscribe to the same topics.

## Runtime Config

The module uses `runtimeConfig.public.mqtt` for configuration. Options include:

- `url`: MQTT broker URL (required)
- other mqtt.js options like `clientId`, `username`, `password`, etc. For more details see [mqtt.js options](https://github.com/mqttjs/MQTT.js#client)

## License
MIT
