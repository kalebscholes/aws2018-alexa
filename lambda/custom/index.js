/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core')
const { DynamoDB } = require('aws-sdk')
const Main = require('mainscreen.json')

const docClient = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

function addChore(child, chore, callback) {
  docClient.put(
    {
      TableName: 'member',
      Item: {
        year: 2018,
        id: child,
        chore: chore
      }
    },
    callback
  )
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = 'Hello Hackathon'

    return (
      handlerInput.responseBuilder
        .speak(speechText)
        // .reprompt(speechText)
        .withSimpleCard('Hello World', speechText)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: Main,
          datasources: {
            choreData: {
              type: 'object',
              properties: {
                title: 'Welcome to Family Manager!',
                subtitle: 'Try: "Alexa, view David\'s Chore List"'
              }
            },
            davidChores: {
              type: 'object',
              properties: {
                firstChore: 'Fold Laundry',
                secondChore: 'Clean Room'
              }
            }
          }
        })
        .getResponse()
    )
  }
}

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent'
    )
  },
  handle(handlerInput) {
    const speechText = 'Hello Your Mom!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const AddChoreIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AddChoreIntent'
    )
  },
  handle(handlerInput) {
    const { requestEnvelope, responseBuilder } = handlerInput
    const { intent } = requestEnvelope.request

    const { slots } = intent
    addChore(slots.FirstName.value, slots.Chore.value, function(err, data) {
      console.log('error', err)
      console.log('kaleb', JSON.stringify(data))
    })

    return responseBuilder
      .speak(
        `Adding ${intent.slots.Chore.value} for ${
          intent.slots.FirstName.value
        } `
      )
      .getResponse()
  }
}

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent'
    )
  },
  async handle(handlerInput) {
    const { requestEnvelope, responseBuilder } = handlerInput
    const { intent } = requestEnvelope.request

    let response = 'it worked'
    try {
      response = `What up ${intent.slots.FirstName.value}`
      await addChore('kaleb', 'vaccuum rugs')
    } catch (e) {
      response = e.message
    }

    return responseBuilder.speak(response).getResponse()
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    )
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name ===
        'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name ===
          'AMAZON.StopIntent')
    )
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    )

    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse()
  }
}

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    AddChoreIntentHandler,
    AnswerIntentHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
