import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SongRatings extends BaseSchema {
  protected tableName = 'song_ratings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').notNullable().unsigned()
      table.integer('song_id').notNullable().unsigned()
      table.foreign('user_id').references('id').inTable('users')
      table.foreign('song_id').references('id').inTable('songs')
      table.integer('rating').notNullable().unsigned()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
