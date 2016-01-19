export default class Validity {
    isValid(edge) {
        return edge.getInVertex().isValid();
    }
}
