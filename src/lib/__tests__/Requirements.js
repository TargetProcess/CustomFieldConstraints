import Requirements from '../Requirements';

describe('Requirements', () => {

    it('getConfig()', () => {

        const req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {}
            }
        }]);

        expect(req.getConfig()).to.be.eql([{
            processId: 1,
            constraints: {
                userstory: {}
            }
        }]);

    });

    it('finds constraint by process id', () => {

        const req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {}
            }
        }]);

        expect(req.getProcessCFConstraintsRule({
            processId: 1
        })).to.be.eql({
            processId: 1,
            constraints: {
                userstory: {}
            }
        });

    });

    it('getEntityTypesToInterrupt()', () => {

        const req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {},
                feature: {}
            }
        }, {
            processId: 2,
            constraints: {
                bug: {}
            }
        }]);

        expect(req.getEntityTypesToInterrupt()).to.be.eql(['userstory', 'feature', 'bug']);

    });

    it('getRequiredCFsForState()', () => {

        const req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: ['xxx', 'yyy']
                    }]
                },
                feature: {}
            }
        }]);

        expect(req.getRequiredCFsForState({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy',
                    value: 'hohoho'
                }]
            },
            requirementsData: {
                newState: {
                    name: 'Open'
                }
            }

        })).to.be.eql([{name: 'xxx'}]);

        expect(req.getRequiredCFsForState({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy',
                    value: 'hohoho'
                }]
            },
            requirementsData: {
                newState: {
                    name: 'Done'
                }
            }

        })).to.be.eql([]);

        expect(req.getRequiredCFsForState({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'yyy',
                    value: 'hohoho'
                }]
            },
            requirementsData: {
                newState: {
                    name: 'Done'
                }
            }

        })).to.be.eql([]);

    });

    it('getRequiredCFsForCFs()', () => {

        let req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {
                    customFields: [{
                        name: 'xxx',
                        valueIn: ['hello'],
                        requiredCustomFields: ['yyy', 'zzz']
                    }]
                },
                feature: {}
            }
        }]);

        expect(req.getRequiredCFsForCFs({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy'
                }, {
                    name: 'zzz'
                }]
            },
            requirementsData: {
                changedCFs: [{
                    name: 'xxx',
                    value: 'hello'
                }]
            }

        })).to.be.eql([{name: 'yyy'}, {name: 'zzz'}]);

        expect(req.getRequiredCFsForCFs({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy'
                }]
            },
            requirementsData: {
                changedCFs: [{
                    name: 'xxx',
                    value: 'hello'
                }]
            }

        })).to.be.eql([{name: 'yyy'}]);

        expect(req.getRequiredCFsForCFs({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy'
                }]
            },
            requirementsData: {
                changedCFs: [{
                    name: 'xxx',
                    value: 'hoho'
                }]
            }

        })).to.be.eql([]);

        req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {
                    customFields: [{
                        name: 'xxx',
                        valueNotIn: ['hello'],
                        requiredCustomFields: ['yyy', 'zzz']
                    }]
                },
                feature: {}
            }
        }]);

        expect(req.getRequiredCFsForCFs({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy'
                }, {
                    name: 'zzz'
                }]
            },
            requirementsData: {
                changedCFs: [{
                    name: 'xxx',
                    value: 'hoho'
                }]
            }

        })).to.be.eql([{name: 'yyy'}, {name: 'zzz'}]);

        req = new Requirements([{
            processId: 1,
            constraints: {
                userstory: {
                    customFields: [{
                        name: 'xxx',
                        valueIn: [1],
                        requiredCustomFields: ['yyy', 'zzz']
                    }]
                },
                feature: {}
            }
        }]);

        expect(req.getRequiredCFsForCFs({
            processId: 1,
            entity: {
                entityType: {
                    name: 'UserStory'
                },
                customFields: [{
                    name: 'xxx'
                }, {
                    name: 'yyy'
                }, {
                    name: 'zzz'
                }]
            },
            requirementsData: {
                changedCFs: [{
                    name: 'xxx',
                    value: ['1', '2']
                }]
            }

        })).to.be.eql([{name: 'yyy'}, {name: 'zzz'}]);

    });

});
