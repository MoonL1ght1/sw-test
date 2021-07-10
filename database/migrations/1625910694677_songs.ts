import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Songs extends BaseSchema {
  protected tableName = 'songs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('artist').notNullable()
      table.string('song_title').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
