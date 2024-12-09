export class InputNodeHandler {
    static async handle(node, context, userInput) {
        console.log('DEBUG: InputNodeHandler.handle started', {
            nodeId: node.id,
            userInput,
            context: typeof context === 'object' ? JSON.stringify(context) : context
        });

        // Robust input extraction
        const safeUserInput = userInput === null || userInput === undefined 
            ? '' 
            : (typeof userInput === 'object' 
                ? (userInput[`${node.id}_response`] || userInput.main_menu_response || userInput.userInput || '')
                : String(userInput));

        if (!safeUserInput) {
            return {
                success: true,
                type: 'input',
                message: node.data.text
            };
        }

        try {
            // Validate input if validation rules exist
            if (node.data.validation) {
                console.log('DEBUG: Validating input', {
                    input: safeUserInput,
                    validation: node.data.validation
                });

                const isValid = await this.validateInput(safeUserInput, node.data.validation);
                console.log('DEBUG: Validation result', { isValid });

                if (!isValid) {
                    return {
                        success: false,
                        type: 'input',
                        message: node.data.validation.errorMessage || 'Invalid input. Please try again.',
                        error: true
                    };
                }
            }

            // Dynamic context variable management
            const contextVariables = { ...context };

            // Store input response in context
            contextVariables[`${node.id}_response`] = safeUserInput;

            // Store in standard format if parameterName is specified
            if (node.data.parameterName) {
                contextVariables[node.data.parameterName] = safeUserInput;
            }

            // Special handling for account number
            if (node.id === 'input_account_number') {
                contextVariables.accountNumber = safeUserInput;
            }

            // If node has specific variable mapping, use it
            if (node.successCallback && node.successCallback.setVariables) {
                for (const [key, value] of Object.entries(node.successCallback.setVariables)) {
                    // Replace {{userInput}} with actual input
                    const processedValue = value.replace(/{{userInput}}/g, safeUserInput);
                    contextVariables[key] = processedValue;
                }
            }

            // Preprocessing steps for additional context enrichment
            if (node.preProcessing && node.preProcessing.steps) {
                for (const step of node.preProcessing.steps) {
                    if (step.type === 'function') {
                        const functionParams = {};
                        
                        // Dynamically process function parameters
                        if (step.params) {
                            for (const [paramKey, paramValue] of Object.entries(step.params)) {
                                // Replace placeholders with actual values
                                functionParams[paramKey] = paramValue.replace(/{{userInput}}/g, safeUserInput);
                            }
                        }

                        console.log('DEBUG: Executing function step', { 
                            action: step.action, 
                            params: functionParams 
                        });

                        // Execute function and store results
                        const functionResponse = await this.executeFunction(
                            { ...step, params: functionParams }, 
                            contextVariables
                        );

                        // If function has a success callback, map its results
                        if (step.successCallback && step.successCallback.setVariables) {
                            for (const [key, value] of Object.entries(step.successCallback.setVariables)) {
                                const processedValue = value.replace(/{{response\.(\w+)}}/g, (_, prop) => 
                                    functionResponse[prop] || ''
                                );
                                contextVariables[key] = processedValue;
                            }
                        }
                    }
                }
            }

            // Determine next node
            let nextNodeId = null;
            if (node.routing && node.routing.conditions) {
                for (const condition of node.routing.conditions) {
                    if (this.evaluateCondition(condition.condition, safeUserInput)) {
                        nextNodeId = condition.next;
                        break;
                    }
                }
                if (!nextNodeId && node.routing.default) {
                    nextNodeId = node.routing.default;
                }
            }
            if (!nextNodeId) {
                nextNodeId = node.next || (node.data && node.data.next);
            }

            console.log('DEBUG: Final context state', {
                context: JSON.stringify(contextVariables)
            });

            // Return success with context
            return {
                success: true,
                type: 'input',
                response: safeUserInput,
                nextNode: nextNodeId || node.next,
                context: contextVariables
            };

        } catch (error) {
            console.error('Error in InputNodeHandler:', {
                error: error.message,
                stack: error.stack
            });
            return {
                success: false,
                type: 'error',
                message: 'Error processing your input. Please try again.',
                context: context
            };
        }
    }

    static evaluateCondition(condition, userInput) {
        console.log('DEBUG: Evaluating condition', { condition, userInput });
        const result = eval(condition.replace(/userInput/g, `'${userInput}'`));
        console.log('DEBUG: Condition result', { result });
        return result;
    }

    static async executeFunction(step, context) {
        console.log('DEBUG: Executing function', {
            action: step.action,
            params: step.params
        });

        if (step.action === 'getUserAccountByNumber') {
            const accountNumber = step.params.accountNumber.replace(/{{userInput}}/g, context[`input_account_number_response`]);
            console.log('DEBUG: Getting user account', { accountNumber });
            
            // Explicitly set accountNumber in context
            context['accountNumber'] = accountNumber;
            
            // Mock response
            const response = {
                userId: "USER123",
                name: "John Doe"
            };
            console.log('DEBUG: User account response', { response });
            return response;
        }
        return {};
    }

    static async validateInput(input, validation) {
        console.log('DEBUG: Validating input', { input, validation });

        if (!validation) return true;

        const { type, pattern, min, max, minLength, maxLength } = validation;

        let isValid = true;
        switch (type) {
            case 'regex':
                isValid = new RegExp(pattern).test(input);
                break;
            case 'number':
                const num = Number(input);
                const numStr = input.toString();
                isValid = !isNaN(num) && 
                       (min === undefined || num >= min) && 
                       (max === undefined || num <= max) &&
                       (minLength === undefined || numStr.length >= minLength) &&
                       (maxLength === undefined || numStr.length <= maxLength);
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
                break;
            default:
                isValid = true;
        }

        console.log('DEBUG: Validation result', { isValid });
        return isValid;
    }
}
