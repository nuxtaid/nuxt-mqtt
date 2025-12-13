import { defineNuxtModule, addPlugin, createResolver, addImportsDir, useLogger } from '@nuxt/kit'
import type { IClientOptions } from 'mqtt'
import defu from 'defu'

export interface ModuleOptions extends IClientOptions {
  /**
   * The URL of the MQTT broker to connect to.
   */
  url: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mqtt',
    configKey: 'mqtt',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    url: undefined,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  },
  setup(_options, _nuxt) {
    const logger = useLogger('nuxt-mqtt')

    if (!_options.url) {
      logger.warn('MQTT broker URL is not defined. Skipping module setup.')
      return
    }

    const { resolve } = createResolver(import.meta.url)

    // TODO: maybe do server side (for private brokers) and client side connections separately

    // Merge user options into runtime config
    const config = _nuxt.options.runtimeConfig
    config.public.mqtt = defu(config.public.mqtt || {}, _options)

    // Register plugin
    addPlugin(resolve('./runtime/plugins/mqtt.client'))

    // Register composables
    addImportsDir(resolve('./runtime/composables'))
  },
})
