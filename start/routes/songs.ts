import Route from '@ioc:Adonis/Core/Route'

// todo: namespace
// add song route
Route.post('/api/songs', async () => {
  return { route: 'add song route' }
})

// del song route
Route.delete('/api/songs', async () => {
  return { route: 'del song route' }
})

// get songs list route
Route.get('/api/songs', async () => {
  return { route: 'get songs list route' }
})
