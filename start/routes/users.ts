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

  try {
    const payload = await request.validate({
      schema: bodySchema
    })

    const { name, email, yearOfBirth } = payload
    const [userId] : [number] = await Database
      .table('users')
      .insert({
        name,
        email,
        year_of_birth: yearOfBirth
      })

    return `user ${JSON.stringify({
      id: userId,
      name,
      email,
      yearOfBirth
    })} created`
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
})

// del user route
Route.delete('/api/users/:id', async ({ response, params }) => {

  try {
    const deleteCount = await Database
      .from('users')
      .where('id', parseInt(params.id))
      .delete()
    return Number(deleteCount) > 0
      ? `user with id=${params.id} deleted`
      : `user with id=${params.id} not found`
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
}).where('id', /^[0-9]+$/)

// get users list route
Route.get('/api/users/:id?', async ({ response, params }) => {
  try {
    const query = Database
      .from('users')
      .select('id', 'name', 'email', 'year_of_birth as yearOfBirth')

      if (params.id) {
        query.where('id', parseInt(params.id))
      }

    return query
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
}).where('id', /^[0-9]+$/)
