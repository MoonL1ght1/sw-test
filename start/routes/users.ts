import Route from '@ioc:Adonis/Core/Route'

// todo: namespace
// add user route
Route.post('/api/users', async ({ request }) => {
  console.log(request.body())
  return { route: 'add user route' }
})

// del user route
Route.delete('/api/users', async () => {
  return { route: 'del user route' }
})

// get users list route
Route.get('/api/users', async () => {
  return { route: 'get users list route' }
})
