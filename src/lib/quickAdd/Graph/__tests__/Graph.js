import Graph from '../Graph';

describe('Graph', () => {

    it('build default graph on costruct', () => {

        const graph = new Graph();

        expect(graph.getVerticesWrapped())
            .to.be.eql({processes: {}});

    });

    it('build with cfs', () => {

        const graph = new Graph([{
            entityTypeName: 'UserStory',
            name: 'xxx',
            processId: 13,
            config: {
                defaultValue: ''
            }
        }], [{
            processId: 13,
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
        }], {
            xxx: 'hello'
        }, () => ({}));

        expect(graph.getVerticesWrapped())
            .to.have.keys(['processes']);
        expect(graph.getVerticesWrapped().processes)
            .to.have.keys(['13']);

    });

});
