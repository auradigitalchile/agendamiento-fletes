// Script para probar la API de producción
const axios = require('axios')

const PRODUCTION_URL = 'https://agendamiento-flete-alpha.vercel.app'

async function testProductionAPI() {
  console.log('🔍 Probando API de producción...\n')
  console.log(`URL: ${PRODUCTION_URL}\n`)

  try {
    // Test 1: Obtener servicios
    console.log('📊 Test 1: GET /api/services')
    const servicesResponse = await axios.get(`${PRODUCTION_URL}/api/services`, {
      timeout: 10000
    })
    console.log(`✅ Status: ${servicesResponse.status}`)
    console.log(`✅ Servicios encontrados: ${servicesResponse.data.length}`)
    if (servicesResponse.data.length > 0) {
      console.log('✅ Primer servicio:', JSON.stringify(servicesResponse.data[0], null, 2))
    }
    console.log('')

  } catch (error) {
    if (error.response) {
      console.error('❌ Error de API:')
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Mensaje: ${JSON.stringify(error.response.data, null, 2)}`)
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor')
      console.error('   Posibles causas:')
      console.error('   - El servidor no está respondiendo')
      console.error('   - Problema de red/CORS')
      console.error('   - Timeout')
    } else {
      console.error('❌ Error:', error.message)
    }
    console.log('')
  }

  try {
    // Test 2: Health check de la página principal
    console.log('🏠 Test 2: GET / (página principal)')
    const homeResponse = await axios.get(PRODUCTION_URL, {
      timeout: 10000
    })
    console.log(`✅ Status: ${homeResponse.status}`)
    console.log(`✅ La página principal carga correctamente`)
    console.log('')
  } catch (error) {
    console.error('❌ Error al cargar página principal:', error.message)
    console.log('')
  }

  // Instrucciones
  console.log('📋 PRÓXIMOS PASOS:\n')
  console.log('Si ves errores arriba, sigue estos pasos en Vercel:\n')
  console.log('1. Ve a: https://vercel.com/dashboard')
  console.log('2. Click en tu proyecto: agendamiento-flete-alpha')
  console.log('3. Ve a: Settings → Environment Variables')
  console.log('4. Verifica que estas variables EXISTAN:\n')
  console.log('   DATABASE_URL = postgresql://neondb_owner:npg_RHeg1P7IxDfS@...')
  console.log('   NEXT_PUBLIC_APP_URL = https://agendamiento-flete-alpha.vercel.app')
  console.log('   NODE_ENV = production\n')
  console.log('5. Si NO existen, agrégalas')
  console.log('6. Ve a: Deployments → Click en el último deployment')
  console.log('7. Click en los 3 puntos → Redeploy → Clear cache\n')
  console.log('8. Espera a que termine el build (~2 minutos)')
  console.log('9. Ejecuta este script nuevamente: node scripts/test-production-api.js\n')
  console.log('📝 Para ver los logs de errores en tiempo real:')
  console.log('   Deployments → Click en deployment activo → Runtime Logs\n')
}

testProductionAPI()
