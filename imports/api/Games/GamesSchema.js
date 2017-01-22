import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import TimestampedSchema from '/imports/common/TimestampedSchema'
import IDValidator from '/imports/common/IDValidator'

const GamesSchema = new SimpleSchema([{
  name: {
    type: String,
    defaultValue: '',
    min: 3,
    max: 255
  },

  isStarted: {
    type: Boolean,
    defaultValue: false,
  },

  isPublic: {
    type: Boolean,
    defaultValue: true,
  },

  maxPlayers: {
    type: Number,
    min: 2 // Yes, it's possible to play The Arbitrary Game with just 2 people, although it requires a pretty special ruleset
  },

  ownerId: {
    type: String,
    custom: IDValidator
  }
}, TimestampedSchema]);

export const GamesCreateSchema = GamesSchema.pick(['name', 'isPublic']);

export default GamesSchema;