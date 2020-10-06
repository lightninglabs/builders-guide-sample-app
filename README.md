# Beginner's Guide to the LND Galaxy

This sample application serves as a guide to begin learning how to communicate with an
[LND](https://github.com/lightningnetwork/lnd/) node to send and receive payments over the
[Lightning Network](http://lightning.network/).

## Overview

The goal of this guide is to get you familiar with adding payments functionality to your
app using the `lnd` Lightning Network node software.

This application will be written in [Typescript](https://www.typescriptlang.org) with a
small amount of HTML+CSS. On the frontend we will use [ReactJS](https://reactjs.org/) to
render the UI and [mobx](https://mobx.js.org/) for managing the application state. On the
backend we will use [expressjs](https://expressjs.com/) to host our API server and serve
the app's data to multiple web clients.

To easily create a local Lightning Network, which exists solely on your computer, we will
be using the [Polar](https://lightningpolar.com/) development tool.

We'll be making use of the LND gRPC [API](https://api.lightning.community/) to interface
with the LND node. A few of the API endpoints that we will be using throughout this
application are:

| Endpoint                                                            | Description                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`getinfo`](https://api.lightning.community/#getinfo)               | returns general information concerning the lightning node                 |
| [`channelbalance`](https://api.lightning.community/#channelbalance) | returns the total funds available across all open channels in satoshis    |
| [`signmessage`](https://api.lightning.community/#signmessage)       | signs a message with this node's private key                              |
| [`verifymessage`](https://api.lightning.community/#verifymessage)   | verifies a signature of a message                                         |
| [`addinvoice`](https://api.lightning.community/#addinvoice)         | creates a new invoice which can be used by another node to send a payment |
| [`lookupinvoice`](https://api.lightning.community/#lookupinvoice)   | look up an invoice according to its payment hash                          |

The sample app we'll be starting with is a basic Reddit clone with this small list of
features:

- view a list of posts on the home page sorted by votes
- click on the Upvote button for a post should increment its number of votes
- create a post containing a username, title, and description

We'll add Lightning Network integration in this tutorial by implementing the following
features:

- connect your node to the app by providing your node's host, certificate and macaroon
- display your node's alias and channel balance
- create posts and sign them using your LND node's pubkey
- verify posts made by other users
- up-vote a post by paying 100 satoshis per vote

## Running the App Locally

Requirements: [NodeJS v12.x](https://nodejs.org/en/download/) &
[Yarn v1.x](https://classic.yarnpkg.com/en/docs/install)

Clone the repo

```
git clone https://github.com/lightninglabs/builders-guide-sample-app.git
```

Install dependencies

```
cd builders-guide-sample-app
yarn
```

Start the API server and client app development server

```
yarn dev
```

Open your browser and navigate to `http://localhost:3000`.
