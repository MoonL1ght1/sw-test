import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'

// todo: namespace
// add user route
Route.post('/api/users', async ({ request, response }) => {
  const bodySchema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ escape: true }, [ rules.email() ]),
    yearOfBirth: schema.number([ rules.range(0, (new Date()).getFullYear() + 1) ]),
  })


  let payload
  try {
    payload = await request.validate({
      schema: bodySchema
    })
  } catch (error) {
    response.badRequest(error.messages)
    return
  }

  const { name, email, yearOfBirth } = payload
  try {
    await Database
      .table('users')
      .insert({
        name,
        email,
        year_of_birth: yearOfBirth
      })
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
  return `user ${JSON.stringify({
    name,
    email,
    year_of_birth: yearOfBirth
  })} created`
})

// del user route
Route.delete('/api/users/:id', async ({ response, params }) => {
  if (isNaN(parseInt(params.id))) {
    response.badRequest('Parameter "id" is not a number!')
    return
  }

  try {
    await Database
      .from('users')
      .where('id', parseInt(params.id))
      .delete()
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }

  return { route: 'del user route' }
})

// get users list route
Route.get('/api/users/:id?', async ({ response, params }) => {
  try {
    const query = Database
      .from('users')
      .select('*')

      if (params.id && !isNaN(parseInt(params.id))) {
        query.where('id', params.id)
      }

      return query
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
  return 'user created'
})
