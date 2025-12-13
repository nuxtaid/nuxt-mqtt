import mqtt from 'mqtt'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.mqtt

  if (!config.url) {
    throw new Error('MQTT broker URL is not defined in the configuration.')
  }

  const client = mqtt.connect(config.url, {
    clientId: config.clientId || 'nuxt_' + Math.random().toString(16).slice(2),
    ...config,
  })

  client.on('connect', () => console.log('✅ MQTT connected'))
  client.on('reconnect', () => console.log('🔄 MQTT reconnecting'))
  client.on('error', err => console.error('❌MQTT error', err))

  return {
    provide: {
      mqtt: client,
    },
  }
})
