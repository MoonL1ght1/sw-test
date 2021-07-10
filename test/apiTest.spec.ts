import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Users API tests:', () => {
  test('Create user', async (assert) => {
    const { body: { id } } = await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'Вася',
        email: 'Vasya@vasyaMail.com',
        yearOfBirth: 1994
      }).expect(200)

    assert.exists(id)
    assert.isNumber(id)
  })

  test('Create user with already exist email', async () => {
    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 'Vasya@vasyaMail.com',
        yearOfBirth: 1994
      }).expect(500)
  })

  test('Create User with wrong parameters', async () => {
    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name1: 'НеВася',
        email: 'NeVasya@vasyaMail.com',
        yearOfBirth: 1994
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email1: 'NeVasya@vasyaMail.com',
        yearOfBirth: 1994
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 'NeVasya@vasyaMail.com',
        yearOfBirth1: 1994
      }).expect(500)
  })

  test('Create User with not accepted parameters', async () => {
    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 'NeVasya@vasyaMail.com',
        yearOfBirth: -2
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 'NeVasya@vasyaMail.com',
        yearOfBirth: 3000
      }).expect(500)

      await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 1,
        yearOfBirth: 1994
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 1,
        email: 'NeVasya@vasyaMail.com',
        yearOfBirth: 1994
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        name: 'НеВася',
        email: 'NotMail',
        yearOfBirth: 1994
      }).expect(500)
  })

  let deletableUserId = null
  test('Create User and check get', async (assert) => {
    const user = {
        name: 'Петя',
        email: 'Petya@petyaMail.com',
        yearOfBirth: 1994
      }
    const { body: { id } } = await supertest(BASE_URL)
      .post('/api/users')
      .send(user).expect(200)

    const { body: [ newUser ] } = await supertest(BASE_URL)
      .get(`/api/users/${id}`)
      .expect(200)

    assert.equal(newUser.name, user.name)
    assert.equal(newUser.email, user.email)
    assert.equal(newUser.yearOfBirth, user.yearOfBirth)
    deletableUserId = id
  })

  test('Check counts of user', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/api/users')
      .expect(200)

    assert.isArray(body)
    assert.equal(body.length, 2)
  })

  test('Check get wrong parameter', async () => {
    await supertest(BASE_URL)
      .get('/api/users/string')
      .expect(404)
  })

  test('Check delete user', async (assert) => {
    const id = deletableUserId
    const { text: result } = await supertest(BASE_URL)
      .delete(`/api/users/${id}`)
      .expect(200)
    
    assert.isString(result)
    assert.isTrue(result.includes(`${id} deleted`))


    const { body } = await supertest(BASE_URL)
      .get(`/api/users/${id}`)
      .expect(200)
    assert.isArray(body)
    assert.isEmpty(body)
  })

  test('Check delete with unexisted id', async () => {
    await supertest(BASE_URL)
      .delete('/api/users/50000')
      .expect(400)
  })

  test('Check delete wrong parameter', async () => {
    await supertest(BASE_URL)
      .delete('/api/users/string')
      .expect(404)
  })
})

test.group('Songs API tests:', () => {
  let songWithoutRatingId = null
  test('Add song', async (assert) => {
    const { body: { id } } = await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 'Metallica',
        songTitle: 'One'
      }).expect(200)

    assert.exists(id)
    assert.isNumber(id)
    songWithoutRatingId = id
  })

  const firstMetallicaRating = 5
  test('Add song with rating', async (assert) => {
    const { body: { id } } = await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 'Metallica',
        songTitle: 'The Unforgiven',
        userRating: {
          userId: 1,
          rating: firstMetallicaRating
        }
      }).expect(200)

    assert.exists(id)
    assert.isNumber(id)
  })

  test('Add song with unaccepted parameters', async () => {
    await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 1,
        songTitle: 'The Unforgiven',
        userRating: {
          userId: 1,
          rating: 5
        }
      }).expect(500)

    await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 'Metallica',
        songTitle: 1,
        userRating: {
          userId: 1,
          rating: 5
        }
      }).expect(500)

      await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 'Metallica',
        songTitle: 'The Unforgiven',
        userRating: {
          userId: 'string',
          rating: 5
        }
      }).expect(500)

      await supertest(BASE_URL)
      .post('/api/songs')
      .send({
        artist: 'Metallica',
        songTitle: 'The Unforgiven',
        userRating: {
          userId: 1,
          rating: 'string'
        }
      }).expect(500)
  })

  let deletableSongId = null
  test('Add song and check get', async (assert) => {
    const song = {
      artist: 'Metallica',
      songTitle: 'Master of Puppets'
    }
    const { body: { id } } = await supertest(BASE_URL)
      .post('/api/songs')
      .send(song).expect(200)

    const { body: [ newSong ] } = await supertest(BASE_URL)
      .get(`/api/songs/${id}`)
      .expect(200)

    deletableSongId = id
    assert.equal(song.artist, newSong.artist)
    assert.equal(song.songTitle, newSong.songTitle)
  })

  test('Check counts of songs', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/api/songs')
      .expect(200)

    assert.isArray(body)
    assert.equal(body.length, 3)
  })

  test('Check get wrong parameter', async () => {
    await supertest(BASE_URL)
      .get('/api/songs/string')
      .expect(404)
  })

  test('Check delete songs', async (assert) => {
    const id = deletableSongId
    const { text: result } = await supertest(BASE_URL)
      .delete(`/api/songs/${id}`)
      .expect(200)
    
    assert.isString(result)
    assert.isTrue(result.includes(`${id} deleted`))


    const { body } = await supertest(BASE_URL)
      .get(`/api/songs/${id}`)
      .expect(200)
    assert.isArray(body)
    assert.isEmpty(body)
  })

  test('Check delete with unexisted id', async () => {
  await supertest(BASE_URL)
      .delete('/api/songs/50000')
      .expect(400)
  })

  test('Check delete wrong parameter', async () => {
    await supertest(BASE_URL)
      .delete('/api/songs/string')
      .expect(404)
  })

  let secondMetallicaRating = 4
  test('Add rating for song', async () => {
    await supertest(BASE_URL)
      .post('/api/songs/addRating')
      .send({
        songId: songWithoutRatingId,
        userId: 1,
        rating: secondMetallicaRating
      }).expect(200)
  })

  test('Check rating by Artist', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/api/songs/artistRating/`)
      .expect(200)

    const { avgArtistRating: MetallicaRating } = body.find(item => item.artist === 'Metallica')
    assert.equal(MetallicaRating, (firstMetallicaRating + secondMetallicaRating) / 2)
  })
})
