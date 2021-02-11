// 4 tests

export default {
    getAll() {

        return [{
            isGeneral: true,
            isAssignable: false,
            isExtendable: false,
            name: 'General'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: false,
            name: 'Bug'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: false,
            name: 'PortfolioEpic'
        }, {
            isGeneral: false,
            isAssignable: false,
            isExtendable: false,
            name: 'User'
        }, {
            isGeneral: true,
            isAssignable: false,
            isExtendable: false,
            name: 'Project'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: true,
            name: 'KeyResult'
        }, {
            isGeneral: true,
            isAssignable: false,
            isExtendable: true,
            name: 'Objective'
        }];

    },

    getAllGenerals() {

        return [{
            isGeneral: true,
            isAssignable: false,
            isExtendable: false,
            name: 'General'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: false,
            name: 'Bug'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: false,
            name: 'PortfolioEpic'
        }, {
            isGeneral: true,
            isAssignable: false,
            isExtendable: false,
            name: 'Project'
        }, {
            isGeneral: true,
            isAssignable: true,
            isExtendable: true,
            name: 'KeyResult'
        }, {
            isGeneral: true,
            isAssignable: false,
            isExtendable: true,
            name: 'Objective'
        }];

    }

};
