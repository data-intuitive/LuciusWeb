import "mocha"
import * as assert from "assert"
import { createFilterCheck, filterData, sortData } from "../js/components/SampleSelection.js"

const filterTestData = [
    { field1:  1, field2: 100, field2_unit: "abc", field3: 1, field3_unit: "foo" },
    { field1:  2, field2: 101, field2_unit: "abc", field3: 1, field3_unit: "foo" },
    { field1:  3, field2: 102, field2_unit: "abc", field3: 1, field3_unit: "foo" },
    { field1:  4, field2: 103, field2_unit: "abc", field3: 1, field3_unit: "foo" },
    { field1:  5, field2: 104, field2_unit: "abc", field3: 1, field3_unit: "foo" },
    { field1:  6, field2: 105, field2_unit: "abc", field3: 2, field3_unit: "foo" },
    { field1:  7, field2: 106, field2_unit: "abc", field3: 2, field3_unit: "foo" },
    { field1:  8, field2: 107, field2_unit: "abc", field3: 2, field3_unit: "foo" },
    { field1:  9, field2: 108, field2_unit: "abc", field3: 2, field3_unit: "foo" },
    { field1: 10, field2: 109, field2_unit: "abc", field3: 2, field3_unit: "foo" },
    { field1:  1, field2: 110, field2_unit: "def", field3: 3, field3_unit: "foo" },
    { field1:  2, field2: 111, field2_unit: "def", field3: 3, field3_unit: "foo" },
    { field1:  3, field2: 112, field2_unit: "def", field3: 3, field3_unit: "foo" },
    { field1:  4, field2: 113, field2_unit: "def", field3: 3, field3_unit: "foo" },
    { field1:  5, field2: 114, field2_unit: "def", field3: 3, field3_unit: "foo" },
    { field1:  6, field2: 115, field2_unit: "def", field3: 4, field3_unit: "foo" },
    { field1:  7, field2: 116, field2_unit: "def", field3: 4, field3_unit: "foo" },
    { field1:  8, field2: 117, field2_unit: "def", field3: 4, field3_unit: "foo" },
    { field1:  9, field2: 118, field2_unit: "def", field3: 4, field3_unit: "foo" },
    { field1: 10, field2: 119, field2_unit: "def", field3: 4, field3_unit: "foo" },    
]

describe("Simple value filter", function() {
    it("filters entries without unit set", () => {
        const filter1 = {
            field1: [
                { type: 'value', value: 1 },
                { type: 'value', value: 2 },
                { type: 'value', value: 3 },
            ]
        }
        const filterOutput1 = filterData(filterTestData, filter1)
        assert.equal(filterOutput1.length, 6)

        const filter2 = {
            field3: [
                { type: 'value', value: 1 },
                { type: 'value', value: 2 },
                { type: 'value', value: 3 },
            ]
        }
        const filterOutput2 = filterData(filterTestData, filter2)
        assert.equal(filterOutput2.length, 15)
    })

    it("filters entries with unit set", () => {
        const filter = {
            field2: [
                { type: 'value', value: 100, unit: 'abc' },
                { type: 'value', value: 101, unit: 'abc' },
                { type: 'value', value: 102, unit: 'abc' },
                { type: 'value', value: 103, unit: 'abc' },
                { type: 'value', value: 104, unit: 'def' },
                { type: 'value', value: 105, unit: 'def' },
                { type: 'value', value: 110, unit: 'def' },
                { type: 'value', value: 111, unit: 'def' },
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 6)
    })
})

describe("Simple range filter", function() {
    it("filters entries without unit set", () => {
        const filter1 = {
            field1: [
                { type: 'range', min: 1, max: 3 },
            ]
        }
        const filterOutput1 = filterData(filterTestData, filter1)
        assert.equal(filterOutput1.length, 6)

        const filter2 = {
            field3: [
                { type: 'range', min: 1, max: 3 },
            ]
        }
        const filterOutput2 = filterData(filterTestData, filter2)
        assert.equal(filterOutput2.length, 15)

        const filter3 = {
            field2: [
                { type: 'range', min: 105, max: 115},
            ]
        }
        const filterOutput3 = filterData(filterTestData, filter3)
        assert.equal(filterOutput3.length, 11)
    })

    it("filter entries without max value set", () => {
        const filter = {
            field2: [
                { type: 'range', min: 105 }
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 15)
    })

    it("filter entries without min value set", () => {
        const filter = {
            field2: [
                { type: 'range', max: 105 }
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 6)
    })

    it("filter entries with unit set", () => {
        const filter = {
            field2: [
                { type: 'range', min: 105, max: 115, unit: "abc" },
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 5)
    })
})

describe("Combined range filter", function() {
    it("filters entries without unit set", () => {
        const filter1 = {
            field1: [
                { type: 'range', min: 1, max: 3 },
                { type: 'range', min: 7, max: 9 },
            ]
        }
        const filterOutput1 = filterData(filterTestData, filter1)
        assert.equal(filterOutput1.length, 12)

        const filter2 = {
            field2: [
                { type: 'range', min: 105, max: 110 },
                { type: 'range', min: 115, max: 117 },
            ]
        }
        const filterOutput2 = filterData(filterTestData, filter2)
        assert.equal(filterOutput2.length, 9)
    })

})

describe("Filter can combine range and value", function() {
    it("filters correctly", () => {
        const filter = {
            field2: [
                { type: 'range', min: 105, max: 115 },
                { type: 'value', value: 117 },
                { type: 'value', value: 118 },
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 13)
    })
})

describe("Filter on two fields at once", function() {
    it("filters correctly", () => {
        const filter = {
            field1: [
                { type: 'range', min: 3, max: 8 }
            ],
            field2: [
                { type: 'range', min: 100, max: 115 }
            ]
        }
        const filterOutput = filterData(filterTestData, filter)
        assert.equal(filterOutput.length, 10)
    })
})
