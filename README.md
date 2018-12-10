# Luzon

*Author*
Moritz Armingeon, [moritz.armingeon@students.fhnw.ch](mailto:moritz.armingeon@students.fhnw.ch)

Luzon is a TaaL (Token-as-a-License) implementation. This prototype is a floating license system as decentralised application. I built Luzon within a Master Thesis Project. The report is available upon request.

Taal is the name of a volcano on the Philippine island Luzon.

# Prerequisites
* Node.js [Link](https://nodejs.org/)
* Truffle (npm install truffle -g) [Link](https://truffleframework.com/)
* Ganache [Link](https://truffleframework.com/ganache)
* Browser with Metamask [Link](https://metamask.io/)

# Deployment


1. Install dependencies
`npm install`

1. Compile contracts
`truffle compile`

1. Migrate contracts
`truffle migrate`

1. Run tests
`truffle test`

1. Start Node Server
`npm run dev`


# Step by Step Guide

## Step 1 - Open ProviderView

| **Details** |
| ------------------ | 
| **User:** AssetProvider|
| **Result:** No Providers deployed yet. |
| ![alt text](img/step01.png) |

## Step 2 - Create a new Provider (SoftCompany1, Symbol SC1)

| **Details** |
| ------------------ | 
| **User:** AssetProvider|
| **Result:** Confirm-Transactiondialog appears. |
| ![alt text](img/step02.png) |

## Step 3 - Show deployed Providers

| **Details** |
| ------------------ | 
| **User:** AssetProvider|
| **Result:** Newly created SoftCompany1 appears. |
| ![alt text](img/step03.png) |

## Step 4 -	Add a software asset (Taskmaster Studio Pro, 10 SC1)

| **Details** |
| ------------------ | 
| **User:** AssetProvider|
| **Result:** Confirm-Transaction dialog appears. |
| ![alt text](img/step04.png) |

## Step 5 - Show ProviderView, List Assets

| **Details** |
| ------------------ | 
| **User:** AssetProvider|
| **Result:** Newly created Taskmaster Studio Pro appears. |
| ![alt text](img/step05.png) |

## Step 6 - Change Account

| **Details** |
| ------------------ | 
| **User:** AssetProvider -> AssetConsumer |
| **Result:** AssetConsumer takes over. |
| ![alt text](img/step06.png) |

## Step 7 - Show Consumer View, Create new Company (CarCompany)

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** Confirm-Transaction dialog appears. |
| ![alt text](img/step07.png) |

## Step 8 - Show Consumer View

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** Newly created CarCompany appears. |
| ![alt text](img/step08.png) |

## Step 9 - Switch to ProviderView

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** ProviderView appears. |
| ![alt text](img/step09.png) |

## Step 10 - Buy Tokens from SoftCompany1. Target address is the contract address of CarCompany

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** Confirm Transaction dialog appears. |
| ![alt text](img/step10.png) |

## Step 11 - Switch to ConsumerView. Add EndUser to the trusted Users

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** Confirm Transaction dialog appears. |
| ![alt text](img/step11.png) |

## Step 12 - Show ConsumerView

| **Details** |
| ------------------ | 
| **User:** AssetConsumer|
| **Result:** Newly added EndUser is part of the users. |
| ![alt text](img/step12.png) |

## Step 13 - Switch User to EndUser, Open UserView

| **Details** |
| ------------------ | 
| **User:** AssetConsumer -> EndUser |
| **Result:** EndUser takes over. |
| ![alt text](img/step13.png) |

## Step 14 - Select CarCompany and Softcompany (Taskmaster Studio Pro), click checkout

| **Details** |
| ------------------ | 
| **User:** EndUser|
| **Result:** Confirm Transaction dialog appears, TestApp (Taskmaster Studio Pro) opens. |
| ![alt text](img/step14.png) |

## Step 15 - Use Taskmaster Studio Pro, click Return 

| **Details** |
| ------------------ | 
| **User:** EndUser|
| **Result:** Confirm Transaction dialog appears, TestApp (Taskmaster Studio Pro) opens. |
| ![alt text](img/step15.png) |

## Step 16 - Test checkout with invalid user

| **Details** |
| ------------------ | 
| **User:** Invalid User|
| **Result:** Checkout is not possible. |
| ![alt text](img/step16.png) |
