import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import Games from './GamesCollection'
import GamesSchema from './GamesSchema'

export const GamesInsert = new ValidatedMethod({
  name: 'Games.insert',
  mixins: [LoggedInMixin],
  checkLoggedInError: {
    error: 'notLogged',
    message: 'You need to be logged in to call this method',
    reason: 'You need to login'
  },
  validate: GamesSchema.pick(['name', 'isPublic']).validator(),
  run: (game) => {
  	return Games.insert(game);
  }
});
