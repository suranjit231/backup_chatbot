const FlowData = {
    "flowId": "banking_service_flow",
    "version": "1.0.0",
    "nodes": [
        {
            "id": "start_node",
            "type": "start",
            "data": {
                "message": "Welcome to our banking service! How can I assist you today?"
            },
            "routing": {
                "next": "welcome_reply_message"
            }
        },
        {
            "id": "welcome_reply_message",
            "type": "question",
            "data": {
                "message": "Hello! I'm here to help you with your banking needs."
            },
            "question": {
                "text": "What would you like to do?",
                "options": [
                    {
                        "label": "Check Balance",
                        "value": "balance",
                        "synonyms": ["balance", "check balance", "show balance", "my balance", "want balance", "i want balance", "i want to check balance"]
                    },
                    {
                        "label": "Transfer Money",
                        "value": "transfer",
                        "synonyms": ["transfer", "send money", "make transfer", "want transfer", "i want to transfer", "i want transfer"]
                    },
                    {
                        "label": "Get a Loan",
                        "value": "loan",
                        "synonyms": ["loan", "need loan", "get loan", "apply loan", "want loan", "loans", "i want loan", "i want loans", "i wants loan", "i need loan"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "loan": ["loan", "need loan", "get loan", "apply loan", "want loan", "loans", "i want loan", "i want loans", "i wants loan", "i need loan"],
                    "balance": ["balance", "check balance", "show balance", "my balance", "want balance", "i want balance", "i want to check balance"],
                    "transfer": ["transfer", "send money", "make transfer", "want transfer", "i want to transfer", "i want transfer"]
                },
                "routingMap": {
                    "loan": "loan_type_selection",
                    "balance": "auth_method_selection",
                    "transfer": "transfer_menu"
                },
                "default": "welcome_reply_message"
            }
        },
        {
            "id": "main_menu",
            "type": "question",
            "question": {
                "text": "What would you like to do?",
                "options": [
                    {
                        "label": "Check Balance",
                        "value": "balance",
                        "synonyms": ["balance", "check balance", "show balance", "my balance"]
                    },
                    {
                        "label": "Transfer Money",
                        "value": "transfer",
                        "synonyms": ["transfer", "send money", "make transfer"]
                    },
                    {
                        "label": "Get a Loan",
                        "value": "loan",
                        "synonyms": ["loan", "need loan", "get loan", "apply loan", "want loan", "loans"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "loan": ["loan", "need loan", "get loan", "apply loan", "want loan", "loans", "i want loan", "i want loans"],
                    "balance": ["balance", "check balance", "show balance", "my balance"],
                    "transfer": ["transfer", "send money", "make transfer", "want to transfer"]
                },
                "routingMap": {
                    "loan": "loan_type_selection",
                    "balance": "auth_method_selection",
                    "transfer": "transfer_menu"
                },
                "default": "clarify_intent"
            }
        },
        {
            "id": "clarify_intent",
            "type": "reply",
            "data": {
                "message": "I'm not sure what you'd like to do. Could you please select one of the options below?"
            }
        },
        {
            "id": "loan_type_selection",
            "type": "question",
            "question": {
                "text": "What type of loan are you interested in?",
                "options": [
                    {
                        "label": "Personal Loan",
                        "value": "personal",
                        "synonyms": ["personal", "personal loan", "i want personal", "want personal"]
                    },
                    {
                        "label": "Business Loan",
                        "value": "business",
                        "synonyms": ["business", "business loan", "i want business", "want business"]
                    },
                    {
                        "label": "Home Loan",
                        "value": "home",
                        "synonyms": ["home", "home loan", "i want home", "want home"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "personal": ["personal", "personal loan", "i want personal", "want personal"],
                    "business": ["business", "business loan", "i want business", "want business"],
                    "home": ["home", "home loan", "i want home", "want home"]
                },
                "routingMap": {
                    "personal": "loan_amount_input",
                    "business": "loan_amount_input",
                    "home": "loan_amount_input"
                },
                "default": "loan_type_selection"
            }
        },
        {
            "id": "loan_amount_input",
            "type": "input",
            "data": {
                "text": "Please enter the loan amount you'd like to apply for:",
                "validation": {
                    "type": "number",
                    "min": 1000,
                    "max": 1000000,
                    "required": true
                },
                "successMessage": "Loan amount received, processing..."
            },
            "routing": {
                "next": "loan_confirmation"
            }
        },
        {
            "id": "loan_confirmation",
            "type": "question",
            "question": {
                "text": "Would you like to proceed with the loan application?",
                "options": [
                    {
                        "label": "Yes, proceed",
                        "value": "yes",
                        "synonyms": ["yes", "proceed", "yes proceed", "continue", "ok", "sure", "go ahead"]
                    },
                    {
                        "label": "No, maybe later",
                        "value": "no",
                        "synonyms": ["no", "later", "maybe later", "cancel", "not now"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "yes": ["yes", "proceed", "yes proceed", "continue", "ok", "sure", "go ahead"],
                    "no": ["no", "later", "maybe later", "cancel", "not now"]
                },
                "routingMap": {
                    "yes": "process_loan_decision",
                    "no": "main_menu"
                },
                "default": "loan_confirmation"
            }
        },
        {
            "id": "process_loan_decision",
            "type": "function",
            "parameter": [
                {
                    "name": "loanAmount",
                    "type": "number",
                    "required": true
                },
                {
                    "name": "loanType",
                    "type": "string",
                    "required": true
                }
            ],
            "functionSuccessNextNode": "loan_application_success",
            "functionFailedNextNode": "loan_application_failure",
            "functionExpression": `
                // Simple loan decision logic
                function processLoanDecision(loanAmount, loanType) {
                    // Mock credit score check
                    const creditScore = Math.floor(Math.random() * 850);
                    
                    // Basic approval criteria
                    // const minCreditScore = 650;
                    const maxLoanAmount = {
                        "personal": 50000,
                        "auto": 75000,
                        "home": 500000
                    }[loanType] || 10000;

                    if (loanAmount <= maxLoanAmount) {
                        return {
                            success: true,
                            message: \`Congratulations! Your loan application for \${loanType} loan of \$\${loanAmount} has been approved.\`
                        };
                    } else {
                        return {
                            success: false,
                            message: "We're sorry, but your loan application cannot be approved at this time."
                        };
                    }
                }
            `
        },
        {
            "id": "loan_application_success",
            "type": "reply",
            "data": {
                "message": "Great news! Your {{loanType}} loan application for ${{loanAmount}} has been approved! Our team will contact you shortly with next steps."
            },
            "routing": {
                "next": "end_session"
            }
        },
        {
            "id": "loan_application_failure",
            "type": "reply",
            "data": {
                "message": "We apologize, but we couldn't process your {{loanType}} loan application for ${{loanAmount}} at this time. Please try again later or contact our support team for assistance."
            },
            "routing": {
                "next": "ask_agent_connection"
            }
        },
        {
            "id": "auth_method_selection",
            "type": "question",
            "data": {
                "message": "Please select how you would like to authenticate."
            },
            "question": {
                "text": "How would you like to authenticate?",
                "options": [
                    {
                        "label": "Account Number",
                        "value": "account",
                        "synonyms": ["account", "account number", "by account"]
                    },
                    {
                        "label": "Mobile Number",
                        "value": "mobile",
                        "synonyms": ["mobile", "mobile number", "by mobile", "phone"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "account": ["account", "account number", "by account", "using account"],
                    "mobile": ["mobile", "mobile number", "by mobile", "phone", "using mobile"]
                },
                "routingMap": {
                    "account": "input_account_number",
                    "mobile": "input_mobile_number"
                }
            }
        },
        {
            "id": "input_account_number",
            "type": "input",
            "data": {
                "text": "Please enter your account number:",
                "validation": {
                    "type": "string",
                    "pattern": "^[0-9]{10}$",
                    "required": true
                },
                "successMessage": "Account number received, processing..."
            },
            "routing": {
                "next": "validate_account_condition"
            }
        },
        {
            "id": "input_mobile_number",
            "type": "input",
            "data": {
                "text": "Please enter your mobile number:",
                "validation": {
                    "type": "string",
                    "pattern": "^[0-9]{10}$",
                    "required": true
                },
                "successMessage": "Mobile number received, processing..."
            },
            "routing": {
                "next": "validate_mobile_condition"
            }
        },
        {
            "id": "validate_account_condition",
            "type": "conditional",
            "name": "Account Number Validation",
            "conditionalGroups": [
                {
                    "conditionName": "Valid Account Number Check",
                    "conditionsChoosed": {
                        "or_condition": false,
                        "and_condition": true
                    },
                    "conditions": [
                        {
                            "variableName": "accountNumber",
                            "operator": "has-any-value",
                            "value": null
                        },
                        {
                            "variableName": "accountNumber",
                            "operator": "Match-Pattern",
                            "value": "^[0-9]{10}$"
                        }
                    ],
                    "nextNode": "fetch_balance_api"
                }
            ],
            "default": "generic_error_reply"
        },
        {
            "id": "validate_mobile_condition",
            "type": "conditional",
            "name": "Mobile Number Validation",
            "conditionalGroups": [
                {
                    "conditionName": "Valid Mobile Number Check",
                    "conditionsChoosed": {
                        "or_condition": false,
                        "and_condition": true
                    },
                    "conditions": [
                        {
                            "variableName": "input_mobile_number_response",
                            "operator": "has-any-value",
                            "value": null
                        },
                        {
                            "variableName": "input_mobile_number_response",
                            "operator": "Match-Pattern",
                            "value": "^[0-9]{10}$"
                        }
                    ],
                    "nextNode": "select_banking_service"
                }
            ],
            "default": "generic_error_reply"
        },
        {
            "id": "generic_error_reply",
            "type": "reply",
            "data": {
                "message": "Sorry, we encountered an issue. Please try again or contact support. Error details: {{errorMessage}}"
            },
            "routing": {
                "next": "ask_agent_connection"
            }
        },
        {
            "id": "select_banking_service",
            "type": "question",
            "question": {
                "text": "What would you like to do?",
                "options": [
                    {
                        "label": "Check Balance",
                        "value": "balance"
                    },
                    {
                        "label": "View Transactions",
                        "value": "transactions"
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "balance": ["balance", "check balance", "show balance"],
                    "transactions": ["transactions", "view transactions", "show transactions"]
                },
                "routingMap": {
                    "balance": "fetch_balance_api",
                    "transactions": "fetch_transactions_api"
                },
                "default": "clarify_intent"
            }
        },
        {
            "id": "fetch_balance_api",
            "type": "api",
            "name": "Fetch Account Balance",
            "description": "API to fetch account balance for a given account number",
            "reqUrl": "http://localhost:5000/api/accounts/{{accountNumber}}/balance",
            "methods": "get",
            "matchedPathVariableList": [
                {
                    "key": "accountNumber",
                    "value": "{{accountNumber}}",
                    "validation": {
                        "type": "string",
                        "required": true
                    }
                }
            ],
            "responseMapPathList": [
                {
                    "jsonPath": "data.balance",
                    "value": "balance",
                    "fallback": "0"
                },
                {
                    "jsonPath": "data.currency",
                    "value": "currency",
                    "fallback": "USD"
                },
                {
                    "jsonPath": "data.lastUpdated",
                    "value": "lastUpdated",
                    "fallback": "Not available"
                }
            ],
            "responseStatus": [
                {
                    "status": 200,
                    "next": "balance_summary_reply",
                    "dataMapping": {
                        "balance": "balance",
                        "currency": "currency",
                        "lastUpdated": "lastUpdated"
                    }
                }
            ],
            "urlParams": [],
            "headers": [
                {
                    "key": "Content-Type",
                    "value": "application/json"
                },
                {
                    "key": "X-API-Version",
                    "value": "1.0"
                }
            ],
            "authorization": {
                "authType": "none",
                "credential": {}
            },
            "body": {
                "type": "none",
                "bodyData": []
            },
            "testBodyData": []
        },
        {
            "id": "balance_summary_reply",
            "type": "reply",
            "data": {
                "message": "Your current balance is ${{balance}} {{currency}}. Last updated: {{lastUpdated}}"
            },
            "next": "display_balance_options"
        },
        {
            "id": "display_balance_options",
            "type": "question",
            "question": {
                "text": "What would you like to do next?",
                "options": [
                    {
                        "label": "View Recent Transactions",
                        "value": "transactions"
                    },
                    {
                        "label": "Back to Main Menu",
                        "value": "main"
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "transactions": ["transactions", "view transactions", "show transactions"],
                    "main": ["main", "menu", "back", "main menu"]
                },
                "routingMap": {
                    "transactions": "fetch_transactions_api",
                    "main": "main_menu"
                },
                "default": "display_balance_options"
            }
        },
        {
            "id": "transactions_summary_reply",
            "type": "reply",
            "data": {
                "message": "Here are your recent transactions:\n- 2024-12-07: +$500 (credit)\n- 2024-12-06: -$100 (debit)"
            },
            "routing": {
              "next": "end_session"
            }
        },
        {
            "id": "fetch_transactions_api",
            "type": "api",
            "name": "Fetch Account Transactions",
            "description": "API to fetch account transactions for a given account number",
            "reqUrl": "http://localhost:5000/api/accounts/{{accountNumber}}/transactions",
            "methods": "get",
            "matchedPathVariableList": [
                {
                    "key": "accountNumber",
                    "value": "{{accountNumber}}",
                    "validation": {
                        "type": "string",
                        "required": true
                    }
                }
            ],
            "responseMapPathList": [
                {
                    "jsonPath": "data.transactions",
                    "value": "transactions",
                    "fallback": "[]"
                },
                {
                    "jsonPath": "data.count",
                    "value": "transactionCount",
                    "fallback": "0"
                }
            ],
            "responseStatus": [
                {
                    "status": 200,
                    "next": "transactions_summary_reply",
                    "dataMapping": {
                        "transactions": "transactions"
                    }
                }
            ],
            "urlParams": [],
            "headers": [
                {
                    "key": "Content-Type",
                    "value": "application/json"
                },
                {
                    "key": "X-API-Version",
                    "value": "1.0"
                }
            ],
            "authorization": {
                "authType": "none",
                "credential": {}
            },
            "body": {
                "type": "none",
                "bodyData": []
            },
            "testBodyData": []
        },
        {
            "id": "transfer_menu",
            "type": "question",
            "question": {
                "text": "What type of transfer would you like to make?",
                "options": [
                    {
                        "label": "Internal Transfer",
                        "value": "internal"
                    },
                    {
                        "label": "External Transfer",
                        "value": "external"
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "internal": ["internal", "within bank", "same bank"],
                    "external": ["external", "other bank", "different bank"]
                },
                "routingMap": {
                    "internal": "internal_transfer",
                    "external": "external_transfer"
                },
                "default": "transfer_menu"
            }
        },
        {
            "id": "internal_transfer",
            "type": "input",
            "data": {
                "text": "Please enter the recipient's account number:",
                "parameterName": "recipientAccountNumber",
                "validation": {
                    "type": "string",
                    "required": true,
                    "minLength": 1
                },
                "successMessage": "Account number received, processing..."
            },
            "next": "internal_transfer_amount"
        },
        {
            "id": "internal_transfer_amount",
            "type": "input",
            "data": {
                "text": "Please enter the transfer amount:",
                "parameterName": "transferAmount",
                "validation": {
                    "type": "number",
                    "required": true,
                    "min": 1
                },
                "successMessage": "Transfer amount received, processing..."
            },
            "next": "internal_transfer_confirmation"
        },
        {
            "id": "internal_transfer_confirmation",
            "type": "question",
            "question": {
                "text": "Please confirm the transfer details:",
                "options": [
                    {
                        "label": "Confirm",
                        "value": "confirm"
                    },
                    {
                        "label": "Cancel",
                        "value": "cancel"
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "confirm": ["confirm", "yes", "proceed"],
                    "cancel": ["cancel", "no", "back"]
                },
                "routingMap": {
                    "confirm": "internal_transfer_api",
                    "cancel": "transfer_menu"
                },
                "default": "internal_transfer_confirmation"
            }
        },
        {
            "id": "internal_transfer_api",
            "type": "api",
            "name": "Internal Account Transfer",
            "description": "API to perform internal account transfer",
            "reqUrl": "http://localhost:5000/api/accounts/{{accountNumber}}/transfers/internal",
            "methods": "post",
            "matchedPathVariableList": [
                {
                    "key": "accountNumber",
                    "value": "{{accountNumber}}",
                    "validation": {
                        "type": "string",
                        "required": true
                    }
                }
            ],
            "responseMapPathList": [
                {
                    "jsonPath": "data.transactionId",
                    "value": "transactionId",
                    "fallback": "UNKNOWN"
                },
                {
                    "jsonPath": "data.status",
                    "value": "transferStatus",
                    "fallback": "PENDING"
                },
                {
                    "jsonPath": "data.amount",
                    "value": "transferredAmount",
                    "fallback": "0"
                }
            ],
            "responseStatus": [
                {
                    "status": 200,
                    "next": "internal_transfer_success"
                }
            ],
            "urlParams": [],
            "headers": [
                {
                    "key": "Content-Type",
                    "value": "application/json"
                },
                {
                    "key": "X-API-Version",
                    "value": "1.0"
                }
            ],
            "authorization": {
                "authType": "none",
                "credential": {}
            },
            "body": {
                "type": "json",
                "bodyData": [
                    {
                        "key": "recipientAccountNumber",
                        "value": "{{recipientAccountNumber}}"
                    },
                    {
                        "key": "transferAmount",
                        "value": "{{transferAmount}}"
                    }
                ]
            },
            "testBodyData": []
        },
        {
            "id": "internal_transfer_success",
            "type": "reply",
            "data": {
                "message": "Transfer successful accountNO: ${{recipientAccountNumber}} amount: ${{transferredAmount}}!"
            },
            "next": "end_session"
        },
        {
            "id": "external_transfer",
            "type": "input",
            "data": {
                "text": "Please enter the recipient's account number and routing number (separated by a comma):",
                "parameterName": "recipientAccountNumber",
                "validation": {
                    "type": "string",
                    "required": true,
                    "minLength": 1
                },
                "successMessage": "Account number received, processing..."
            },
            "next": "external_transfer_amount"
        },
        {
            "id": "external_transfer_amount",
            "type": "input",
            "data": {
                "text": "Please enter the transfer amount:",
                "parameterName": "transferAmount",
                "validation": {
                    "type": "number",
                    "required": true,
                    "min": 1
                },
                "successMessage": "Transfer amount received, processing..."
            },
            "next": "external_transfer_confirmation"
        },
        {
            "id": "external_transfer_confirmation",
            "type": "question",
            "question": {
                "text": "Please confirm the transfer details:",
                "options": [
                    {
                        "label": "Confirm",
                        "value": "confirm"
                    },
                    {
                        "label": "Cancel",
                        "value": "cancel"
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "confirm": ["confirm", "yes", "proceed"],
                    "cancel": ["cancel", "no", "back"]
                },
                "routingMap": {
                    "confirm": "external_transfer_api",
                    "cancel": "transfer_menu"
                },
                "default": "external_transfer_confirmation"
            }
        },
        {
            "id": "external_transfer_api",
            "type": "api",
            "name": "External Transfer",
            "description": "API to perform external account transfer",
            "reqUrl": "http://localhost:5000/api/accounts/{{accountNumber}}/transfers/external",
            "methods": "post",
            "matchedPathVariableList": [
                {
                    "key": "accountNumber",
                    "value": "{{accountNumber}}",
                    "validation": {
                        "type": "string",
                        "required": true
                    }
                }
            ],
            "responseMapPathList": [
                {
                    "jsonPath": "data.transactionId",
                    "value": "transactionId",
                    "fallback": "UNKNOWN"
                },
                {
                    "jsonPath": "data.status",
                    "value": "transferStatus",
                    "fallback": "PENDING"
                },
                {
                    "jsonPath": "data.amount",
                    "value": "transferredAmount",
                    "fallback": "0"
                },
                {
                    "jsonPath": "data.fee",
                    "value": "transferFee",
                    "fallback": "0"
                }
            ],
            "responseStatus": [
                {
                    "status": 200,
                    "next": "external_transfer_success"
                }
            ],
            "urlParams": [],
            "headers": [
                {
                    "key": "Content-Type",
                    "value": "application/json"
                },
                {
                    "key": "X-API-Version",
                    "value": "1.0"
                }
            ],
            "authorization": {
                "authType": "none",
                "credential": {}
            },
            "body": {
                "type": "json",
                "bodyData": [
                    {
                        "key": "recipientAccountNumber",
                        "value": "{{recipientAccountNumber}}"
                    },
                    {
                        "key": "transferAmount",
                        "value": "{{transferAmount}}"
                    }
                ]
            },
            "testBodyData": []
        },
        {
            "id": "external_transfer_success",
            "type": "reply",
            "data": {
                "message": "Transfer successful accountNO:{{recipientAccountNumber}} amount: ${{transferredAmount}}!"
            },
            "next": "end_session"
        },
        {
            "id": "end_session",
            "type": "end",
            "data": {
                "message": "Thank you for using our banking services. Have a great day!"
            }
        },
        {
            "id": "ask_agent_connection",
            "type": "question",
            "data": {
                "message": "Would you like to speak with a customer service agent? They can help you with more complex queries or provide detailed assistance."
            },
            "question": {
                "text": "Connect with an agent?",
                "options": [
                    {
                        "label": "Yes, connect me",
                        "value": "yes",
                        "synonyms": ["yes", "connect", "agent", "speak with agent", "talk to agent", "human", "representative"]
                    },
                    {
                        "label": "No, continue with bot",
                        "value": "no",
                        "synonyms": ["no", "continue", "bot", "chatbot", "stay"]
                    }
                ]
            },
            "routing": {
                "inputMappings": {
                    "yes": ["yes", "connect", "agent", "speak with agent", "talk to agent", "human", "representative"],
                    "no": ["no", "continue", "bot", "chatbot", "stay"]
                },
                "routingMap": {
                    "yes": "connect_to_agent",
                    "no": "main_menu"
                }
            }
        },
        {
            "id": "connect_to_agent",
            "type": "agent_handoff",
            "data": {
                "message": "I'll connect you with an available agent now. Please wait a moment..."
            },
            "routing": {
                "next": "end_node"
            }
        }
    ],
    "edges": [
        {
            "id": "edge_start_to_welcome",
            "source": "start_node",
            "target": "welcome_reply_message"
        },
        {
            "id": "edge_welcome_to_main",
            "source": "welcome_reply_message",
            "target": "main_menu"
        },
        {
            "id": "edge_main_to_loan",
            "source": "main_menu",
            "target": "loan_type_selection"
        },
        {
            "id": "edge_main_to_balance",
            "source": "main_menu",
            "target": "auth_method_selection"
        },
        {
            "id": "edge_main_to_transfer",
            "source": "main_menu",
            "target": "transfer_menu"
        },
        {
            "id": "edge_main_to_clarify",
            "source": "main_menu",
            "target": "clarify_intent"
        },
        {
            "id": "edge_clarify_to_main",
            "source": "clarify_intent",
            "target": "main_menu"
        },
        {
            "id": "edge_error_to_main",
            "source": "generic_error_reply",
            "target": "ask_agent_connection"
        },
        {
            "id": "edge_auth_to_fetch_balance",
            "source": "auth_method_selection",
            "target": "fetch_balance_api"
        },
        {
            "id": "edge_fetch_to_balance",
            "source": "fetch_balance_api",
            "target": "balance_summary_reply"
        },
        {
            "id": "edge_balance_to_options",
            "source": "balance_summary_reply",
            "target": "display_balance_options"
        },
        {
            "id": "edge_options_to_transactions",
            "source": "display_balance_options",
            "target": "fetch_transactions_api"
        },
        {
            "id": "edge_transactions_api_to_summary",
            "source": "fetch_transactions_api",
            "target": "transactions_summary_reply"
        },
        {
            "id": "edge_transactions_to_main",
            "source": "transactions_summary_reply",
            "target": "main_menu"
        },
        {
            "id": "edge_loan_type_to_process",
            "source": "loan_type_selection",
            "target": "loan_amount_input"
        },
        {
            "id": "edge_loan_amount_to_confirm",
            "source": "loan_amount_input",
            "target": "loan_confirmation"
        },
        {
            "id": "edge_loan_confirm_to_process",
            "source": "loan_confirmation",
            "target": "process_loan_decision"
        },
        {
            "id": "edge_process_to_end",
            "source": "process_loan_decision",
            "target": "end_session"
        },
        {
            "id": "edge_transfer_to_internal",
            "source": "transfer_menu",
            "target": "internal_transfer"
        },
        {
            "id": "edge_transfer_to_external",
            "source": "transfer_menu",
            "target": "external_transfer"
        },
        {
            "id": "edge_internal_to_amount",
            "source": "internal_transfer",
            "target": "internal_transfer_amount"
        },
        {
            "id": "edge_internal_amount_to_confirm",
            "source": "internal_transfer_amount",
            "target": "internal_transfer_confirmation"
        },
        {
            "id": "edge_internal_confirm_to_api",
            "source": "internal_transfer_confirmation",
            "target": "internal_transfer_api"
        },
        {
            "id": "edge_internal_api_to_success",
            "source": "internal_transfer_api",
            "target": "internal_transfer_success"
        },
        {
            "id": "edge_external_to_amount",
            "source": "external_transfer",
            "target": "external_transfer_amount"
        },
        {
            "id": "edge_external_amount_to_confirm",
            "source": "external_transfer_amount",
            "target": "external_transfer_confirmation"
        },
        {
            "id": "edge_external_confirm_to_api",
            "source": "external_transfer_confirmation",
            "target": "external_transfer_api"
        },
        {
            "id": "edge_external_api_to_success",
            "source": "external_transfer_api",
            "target": "external_transfer_success"
        },
        {
            "id": "edge_success_to_end",
            "source": "internal_transfer_success",
            "target": "end_session"
        },
        {
            "id": "edge_external_success_to_end",
            "source": "external_transfer_success",
            "target": "end_session"
        },
        {
            "id": "edge_loan_failure_to_agent",
            "source": "loan_application_failure",
            "target": "ask_agent_connection"
        },
        {
            "id": "edge_balance_failure_to_agent",
            "source": "balance_fetch_failure",
            "target": "ask_agent_connection"
        },
        {
            "id": "edge_transfer_failure_to_agent",
            "source": "transfer_failure",
            "target": "ask_agent_connection"
        }
    ],
    "metadata": {
        "flowType": "banking",
        "version": "1.0.0",
        "createdAt": "2024-01-17",
        "updatedAt": "2024-01-17",
        "description": "Banking services flow with authentication and balance check functionality",
        "supportedLanguages": [
            "en"
        ],
        "defaultLanguage": "en"
    },
    "startNode": "start_node"
};

export default FlowData;
