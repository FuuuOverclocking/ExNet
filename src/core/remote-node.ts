export namespace RemoteNode {
    export const enum EventType {
        NodeDidPipe = 0,
        NodeDidUnpipe = 1,
        NodeDidBecomeChild = 2,
        NodeWillRunNotice = 3,
        NodeDidRunNotice = 4,
        NodePortsStateChange = 5,
        NodeStateChange = 6,
        NodeGoOnline = 7,
        NodeGoOffline = 8,
        RemoteError = 9,

        NumberOfEventTypes = 10,
    }
}
