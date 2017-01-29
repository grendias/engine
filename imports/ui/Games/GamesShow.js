import {every} from "lodash";
import classnames from "classnames";
import {Header, Icon, List, Button, Label, Card, Form, Input} from "semantic-ui-react";
import {Meteor} from "meteor/meteor";
import {createContainer} from "meteor/react-meteor-data";
import AutoForm from "uniforms-semantic/AutoForm";
import React from "react";
import {Redirect} from "react-router";
import moment from "moment";
import Games from "/imports/api/Games/GamesCollection";
import Players from "/imports/api/Players/PlayersCollection";
import Actions from "/imports/api/Actions/ActionsCollection";
import Users from "/imports/api/Users/UsersCollection";
import {GamesStart, GamesSetOpponent} from "/imports/api/Games/GamesMethods";
import {PlayersInsert} from "/imports/api/Players/PlayersMethods";
import {ChooseOpponentActionsSchema, BetActionsSchema} from "../../api/Actions/ActionsSchema";
import SubmitField from "uniforms-semantic/SubmitField";
import connectField from "uniforms/connectField";
import filterDOMProps from "uniforms/filterDOMProps";


var noneIfNaN = function noneIfNaN(x) {
  return isNaN(x) ? undefined : x;
};
// https://github.com/vazco/uniforms#example-cyclefield

const AmountFieldWithSubmit = ({onChange, value, decimal, errorMessage, disabled, id, max, min, name, placeholder, inputRef}) => {
  return (
    <Form.Field>
      { errorMessage && <Label basic color='red' pointing='below'>{errorMessage}</Label>}
      <Input
        value={value}
        onChange={ event => onChange(noneIfNaN((decimal ? parseFloat : parseInt)(event.target.value)))}
        action={<Button icon='play' className="violet" />}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        name={name}
        placeholder={placeholder}
        ref={inputRef}
        step={decimal ? 0.01 : 1}
        type='number'
      />
    </Form.Field>
  )
};

export const ConnectedAmountFieldWithSubmit = connectField(AmountFieldWithSubmit);


const renderSelect = ({
    allowedValues,
    disabled,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    transform,
    value
  }) =>
    <select
      disabled={disabled}
      id={id}
      name={name}
      onChange={event => onChange(event.target.value)}
      ref={inputRef}
      value={value}
    >
      {(!!placeholder || !required) && (
        <option value="" disabled={required} hidden={required}>
          {placeholder ? placeholder : label}
        </option>
      )}
      {allowedValues.map(value =>
        <option key={value} value={value}>
          {transform ? transform(value) : value}
        </option>
      )}
    </select>
  ;

const SelectUserFieldWithSubmit = ({
    allowedValues,
    checkboxes,
    className,
    disabled,
    error,
    errorMessage,
    fieldType,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    showInlineError,
    transform,
    value,
    ...props
  }) =>
    <Button icon='play' labelPosition='left' className="violet" style={{width: "100%"}} label={
      <section style={{marginBottom: "0px", width: "100%"}} className={classnames({
        disabled,
        error,
        required
      }, className, 'field')} {...filterDOMProps(props)}>
        {/* eslint-disable max-len */}
        {checkboxes || fieldType === Array
          ? renderCheckboxes({allowedValues, disabled, id, name, onChange, transform, value, fieldType})
          : renderSelect({
            allowedValues,
            disabled,
            id,
            name,
            onChange,
            transform,
            value,
            inputRef,
            label,
            placeholder,
            required
          })
        }
        {/* eslint-enable */}
        {/*{!!(errorMessage && showInlineError) && (*/}
        {/*<section className="ui red basic pointing label">*/}
        {/*{errorMessage}*/}
        {/*</section>*/}
        {/*)}*/}
      </section>} />
  ;

export const ConnectedSelectUserFieldWithSubmit = connectField(SelectUserFieldWithSubmit);

export class GamesShowComponent extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  onBackClick() {
    this.setState({goBack: true});
  }

  onOpponentSelectSubmit(opponent) {
    // TODO: https://trello.com/c/zOcfeLOd/13-implement-loading-state-for-gamescreate-form
    const {game} = this.props;
    // console.log('game', game);
    console.log('opponent', opponent);
    GamesSetOpponent.call({gameId: game._id, opponent});
  }

  onOpponentBetSubmit(opponent) {
    console.log('opponent', opponent);
    // TODO: https://trello.com/c/zOcfeLOd/13-implement-loading-state-for-gamescreate-form
    // const {game, maxBet} = this.props;
    // console.log('maxBet', maxBet);
    // if (opponent.amount > maxBet) {
    //   ActionsInsert.call({playerId: currentUserId, type: "Raise", amount: opponent.amount, gameId: game._id})
    // }
    // else {
    //   ActionsInsert.call({playerId: currentUserId, type: "Bet", amount: opponent.amount, gameId: game._id})
    // }
  }


  renderPlayerActionHeader(expectation) {
    let header;
    switch (expectation.type) {
      case "ChooseOpponent":
        header = 'Выберите оппонента';
        break;
      case "Raise":
        header = 'Укажите размер пари';
        break;
      case "Stake":
        header = 'Укажите размер ставки';
        break;
      case "Vote":
        header = 'За кого вы голосуете?';
        break;
      default:
        throw new Error(`Undefined action type: ${action.type}`);
        break;
    }
    return header
  }

  renderCurrentPlayerActionBody(expectation) {
    let header;
    // switch (type) {
    //   case "ChooseOpponent":
    //     header = 'Please, select on opponent';
    //     break;
    //   case "Raise":
    //     header = 'Please, place your bet or raise';
    //     break;
    //   case "Stake":
    //     header = 'Please, place your stake';
    //     break;
    //   case "Vote":
    //     header = 'Please, place your vote';
    //     break;
    //   default:
    //     throw new Error(`Undefined action type: ${action.type}`);
    //     break;
    // }
    return header
  }

  renderOtherPlayerActionHeader(expectation) {
    let header;
    const playerName = this.getNameByPlayerId(expectation.playerId);
    switch (expectation.type) {
      case "ChooseOpponent":
        header = `${playerName} выбирает оппонента...`;
        break;
      case "Raise":
        header = `Wait for ${playerName} to bet`;
        break;
      case "Stake":
        header = `Wait for ${playerName} to stake`;
        break;
      case "Vote":
        header = `Wait for ${playerName} to vote`;
        break;
      default:
        throw new Error(`Undefined action type: ${action.type}`);
        break;
    }
    return header;
  }

  renderOtherPlayerActionBody(expectation) {

  }

  render() {
    const {
      isLoading, game, users, joinGame, joined, isOwner,
      startGame, isInitiator, isOpponent, messages, expectations
    } = this.props;

    if (this.state.goBack) {
      return <Redirect to="/" />
    }

    if (isLoading) {
      return (
        <div>
          <span>{'Игра загружается...'}</span>
        </div>
      )
    }

    return (
      <div>
        {this.renderHeader("games-header fixed")}
        {this.renderHeader("games-header fixed-doubler") /* Rendering header twice to push the content down: http://stackoverflow.com/a/6414716/303694 */}
        {
          !game.isStarted &&
          <div>
            <Header size='medium'>Участники</Header>
            <List ordered>
              {users.map(user => (
                <List.Item key={user._id}>
                  <List.Content>
                    <List.Header>{user.profile.name}</List.Header>
                  </List.Content>
                </List.Item>
              ))}
            </List>
            {
              !joined &&
              <Button
                onClick={joinGame}
                icon="add user"
                className="marginal"
                color="violet"
                basic
                fluid
                compact
                content={'Присоединиться'}
              />
            }
            {
              joined &&
              <Label
                basic
                className="marginal"
                color="blue"
              >{'Вы присоединены к игре'}</Label>
            }
            {
              // TODO: move the "users.length > 2" check into Ruleset
              !game.isStarted && isOwner && (users.length > 2) &&
              <Button
                onClick={startGame}
                icon="game"
                className="marginal"
                color="green"
                basic
                fluid
                compact
                content={'Начать игру'}
              />
            }
          </div>
        }
        {
          game.isStarted &&
          this.renderChat()
        }
      </div>
    );
  }

  renderChat() {
    const {game, expectations} = this.props;
    return (
      <div className={game.isStarted && expectations && expectations.length ? "comments comments-with-margin-and-notice" : "comments comments-with-margin"}>
        {this.renderMessages()}
        {
          game.isStarted && expectations && expectations.length &&
          <div className="fixed-form">
            {this.renderLabel()}
            {this.renderAction()}
          </div>
        }
        {/*{!isInitiator && !isOpponent &&*/}
        {/*<Label basic className="marginal" color='green'>Bet initiator is {game.initiatorId} </Label>*/}
        {/*}*/}
        {/*{!isInitiator && !isOpponent && game.opponentId &&*/}
        {/*<Label basic className="marginal" color='green'>Opponent is {game.opponentId} </Label>*/}
        {/*}*/}
      </div>
    )
  }

  renderMessages() {
    const {game, messages, currentUserId} = this.props;
    return (
      <Card.Group>
        {messages.map((message, index) => (
          <Card key={index} className={message.playerId === currentUserId ? "owned-by-me" : "user"}>
            {/*<Card.Avatar src='http://semantic-ui.com/images/avatar/small/matt.jpg' />*/}
            <Card.Content>
              <Card.Header>
                {
                  message.playerId &&
                  message.playerId /* Display an actual name */
                }
              </Card.Header>
              <Card.Meta>
                <div>{moment(message.createdAt).format("HH:mm")}</div>
              </Card.Meta>
              <Card.Description>
                {message.type} {message.amount}
              </Card.Description>
              {/*<Card.Actions>*/}
              {/*<Card.Action>Reply</Card.Action>*/}
              {/*</Card.Actions>*/}
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    )
  }

  renderHeader(className) {
    const {game, expectations} = this.props;
    return (
      <div className={className}>
        <Header as="h3">
          <Icon link name="chevron left" size="small" onClick={this.onBackClick.bind(this)} />
          {game.name}
        </Header>
        {/*<p>{game.name}</p>*/}
        {/*{*/}
        {/*game.isStarted && messages && messages.length &&*/}
        {/*<Menu pagination>*/}
        {/*{messages.map((round, index) => (*/}
        {/*<Menu.Item key={index++} name={"Round" + index++}>*/}
        {/*</Menu.Item>*/}
        {/*))}*/}
        {/*</Menu>*/}
        {/*}*/}
      </div>
    )
  }

  renderLabel() {
    const {expectations, currentUserId} = this.props;
    return (
      <Label basic color='violet' pointing='below'>
        {expectations[0].playerId === currentUserId ? this.renderPlayerActionHeader(expectations[0]) : this.renderOtherPlayerActionHeader(expectations[0])}
      </Label>
    )
  }

  renderAction() {
    const {game, expectations, currentUserId} = this.props;
    console.log("expectations", expectations);
    //TOOD execute own expectations first
    if (expectations[0].playerId !== currentUserId) {
      return (
        <AutoForm
          schema={BetActionsSchema}
          onChange={ (name, val) => this.setState({lastAmount: val})}
          onSubmit={this.onOpponentBetSubmit.bind(this)}
          model={expectations[0]}
        >
          <ConnectedAmountFieldWithSubmit name="amount" disabled={true} placeholder="Input stake" />
        </AutoForm>
      )
    }

    switch (expectations[0].type) {
      case "ChooseOpponent":
        return (
          <AutoForm
            schema={ChooseOpponentActionsSchema}
            submitField={() => <SubmitField className="violet basic fluid compact" />}
            onSubmit={this.onOpponentSelectSubmit.bind(this)}
            model={expectations[0]}
          >
            <ConnectedSelectUserFieldWithSubmit name="opponentId" transform={this.getNameByPlayerId} allowedValues={game.players({userId: {$ne: currentUserId}}, {
              sort: {
                stash: 1,
                createdAt: 1
              }
            }).map(i => i._id)} />
          </AutoForm>
        );
        break;
      case "Raise":
        return (
          <AutoForm
            schema={BetActionsSchema}
            onChange={ (name, val) => this.setState({lastAmount: val})}
            onSubmit={this.onOpponentBetSubmit.bind(this)}
            model={expectations[0]}
          >
            <ConnectedAmountFieldWithSubmit name="amount" placeholder="Input amount" />
          </AutoForm>
        )
        break;
      case "Stake":
        return (
          <AutoForm
            schema={BetActionsSchema}
            onChange={ (name, val) => this.setState({lastAmount: val})}
            onSubmit={this.onOpponentBetSubmit.bind(this)}
            model={expectations[0]}
          >
            <ConnectedAmountFieldWithSubmit name="amount" placeholder="Input stake" />
          </AutoForm>
        )
        break;
      case "Vote":
        header = `Wait for ${playerName} to vote`;
        break;
      default:
        throw new Error(`Undefined action type: ${action.type}`);
        break;
    }
  }

  getNameByPlayerId(playerId) {
    const player = Players.findOne(playerId);
    if (!player) debugger;
    const user = player.user({}, {fields: {"profile.name": 1}});
    return user.profile.name;
  }
}

export const GamesShowContainer = createContainer(({params: {_id}}) => {
  let subscriptions = [];
  subscriptions.push(Meteor.subscribe('Games.showById', _id));
  const isLoading = !every(subscriptions, subscription => subscription.ready());
  const currentUserId = Meteor.userId();
  const game = Games.findOne(_id);
  const players = Players.find({gameId: _id}).fetch();
  const userIds = players.map(player => player.userId);
  const users = Users.find({_id: {$in: userIds}}).fetch();
  const actions = Actions.find({gameId: _id}).fetch();
  const joined = Players.find({gameId: _id, userId: currentUserId}).count() > 0;
  const isOwner = game && game.ownerId === currentUserId;
  const isInitiator = game && game.initiatorId === currentUserId;
  const isOpponent = game && game.opponentId === currentUserId;
  const joinGame = () => PlayersInsert.call({gameId: _id});
  const startGame = () => GamesStart.call({gameId: _id});

  const maxBetQuery = game && game.actions({type: "Raise"}, {sort: {amount: -1}, limit: 1}).fetch();

  const maxBet = maxBetQuery && maxBetQuery.length && maxBetQuery[0].amount;

  let data = {
    isLoading,
    currentUserId,
    game,
    users,
    actions,
    joined,
    joinGame,
    startGame,
    isOwner,
    isInitiator,
    isOpponent
  };

  if (game) {
    const ruleset = game.ruleset();
    /* <DEBUG> */
    const {expectations, messages} = ruleset.getState();
    messages.push({type: "Start", createdAt: game.startedAt});
    // const expectations = [{type: "ChooseOpponent", playerId: "WinstonChurchillUser"}];
    // const messages = [{name: "Round 1"}, {name: "Round 2"}, {name: "Round 3"}];
    /* </DEBUG> */
    data.expectations = expectations;
    data.messages = messages;
  }

  return data;
}, GamesShowComponent);

export default GamesShowContainer;
