import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'

// todo: namespace
// add song route
Route.post('/api/songs', async ({ request, response }) => {
  const bodySchema = schema.create({
    artist: schema.string({ trim: true }),
    songTitle: schema.string({ trim: true }),
    userRating: schema.object.optional().members({
      userId: schema.number([ rules.unsigned() ]),
      rating: schema.number([ rules.range(0, 6) ])
    })
  })

  try {
    const payload = await request.validate({
      schema: bodySchema
    })

    const { artist, songTitle, userRating: { userId, rating } = {} } = payload
    // разумно было бы проверить есть ли такая песня в списке!
    const [songId] : [number] = await Database
      .table('songs')
      .insert({
        artist,
        song_title: songTitle
      })

    if (userId && rating) {
      await Database
        .table('song_ratings')
        .insert({
          user_id: userId,
          song_id: songId,
          rating
        })
    }

    return {
      id: songId,
      artist,
      songTitle
    }
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
})

// del song route
Route.delete('/api/songs/:id', async ({ response, params }) => {
  try {
    const deleteCount = await Database
      .from('songs')
      .where('id', parseInt(params.id))
      .delete()

      return Number(deleteCount) > 0
        ? `song with id=${params.id} deleted`
        : response.badRequest(`song with id=${params.id} not found`)
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
}).where('id', /^[0-9]+$/)

// get songs list route
Route.get('/api/songs/:id?', async ({ response, params }) => {
  try {
    const query = Database
      .from('songs')
      .select('id', 'artist', 'song_title as songTitle')

      if (params.id) {
        query.where('id', parseInt(params.id))
      }

    return query
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
}).where('id', /^[0-9]+$/)

// get songs with avg Rating
Route.get('/api/songs/withRatings', async ({ response, params }) => {
  try {
    const query = Database
      .from('songs')
      .rightJoin('song_ratings', 'songs.id', 'song_ratings.song_id')
      .groupBy('songs.id', 'songs.artist', 'songs.song_title')
      .select('songs.id', 'songs.artist', 'songs.song_title as songTitle')
      .avg('song_ratings.rating as avgRating')

      if (params.id) {
        query.where('songs.id', parseInt(params.id))
      }

    return query
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
}).where('id', /^[0-9]+$/)

Route.post('/api/songs/addRating', async ({ request, response }) => {
  const bodySchema = schema.create({
    songId: schema.number([ rules.unsigned() ]),
    userId: schema.number([ rules.unsigned() ]),
    rating: schema.number([ rules.range(0, 6) ])
  })

  try {
    const payload = await request.validate({
      schema: bodySchema
    })

    const { songId, userId, rating } = payload
    const [{ total }] = await Database
      .from('song_ratings')
      .where({
        song_id: songId,
        user_id: userId
      })
      .count('* as total')

    if (Number(total) > 0) {
      await Database
        .from('song_ratings')
        .where({
            song_id: songId,
            user_id: userId
          })
        .update({ rating: rating })
    } else {
      await Database
        .table('song_ratings')
        .insert({
          song_id: songId,
          user_id: userId,
          rating: rating
        })
    }
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
})

Route.get('/api/songs/artistRating/:artist?', async ({ response, params }) => {
  try {
    const query = Database
      .from('song_ratings')
      .leftJoin('songs', 'songs.id', 'song_ratings.song_id')
      .groupBy('songs.artist')
      .select('songs.artist')
      .avg('song_ratings.rating as avgArtistRating')

      if (params.artist) {
        query.whereRaw(`LOWER(songs.artist) like '%${params.artist.toLowerCase()}%'`,)
      }

    return query
  } catch (e) {
    response.status(500).send(`Error occured: ${JSON.stringify(e, null, ' ')}`)
  }
})
