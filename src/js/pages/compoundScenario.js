export const scenario = [
    { // Initiate ghost mode
        delay: 10,
        state: { form: { check: { ghostinput: true } } },
    },
    { //Form
        delay: 500,
        state: { form: { check: { input: "1", showSuggestions: true, validated: false } } },
        message: {
            text: 'Start typing the JNJ number or name of a compound',
            duration: 4000
        }
    },
    {
        delay: 200,
        state: { form: { check: { input: "12", showSuggestions: true, validated: false } } },
    },
    {
        delay: 300,
        state: { form: { check: { input: "123", showSuggestions: true, validated: false } } },
        message: {
            text: 'Select from the list of matches',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: { form: { check: { input: "123175", showSuggestions: false, validated: true } } },
    },
    {
        delay: 10,
        state: { form: { check: { showSuggestions: false, validated: true } } },
    },
    {
        delay: 1000,
        state: { form: { check: { ghostoutput : true } } },
        message: {
            text: 'Press GO...',
            duration: 4000
        }
    },
    // Sample Selection
    {
        delay: 1000,
        state: { form: { sampleSelection: { data : {  index: 0,  value: { use: false } } } } },
        message: {
            text: 'Select or de-select the samples',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { sampleSelection: { data : {  index: 1,  value: { use: false } } } } },
    },
    {
        delay: 1000,
        state: { form: { sampleSelection: { ghostoutput : true, output: ['GJA130_B14'] } } },
        message: {
            text: 'Press Select',
            duration: 4000
        }
    },
    { // Signature
        delay: 1000,
        state: { },
        message: {
            text: 'Tip: The resulting signature can be copy/pasted elsewhere',
            duration: 4000
        }
    },    
    { // Rest of page
        delay: 2000,
        state: { },
        message: {
            text: 'Please scroll down to see the tables...',
            duration: 4000
        }
    }

]