import { Server } from 'socket.io';

export function initTvChannel(io: Server) {
  const tv = io.of('/tv');

  tv.on('connection', (socket) => {
    socket.emit('hello', { ok: true });
  });

  return {
    broadcastDrawEmerge(payload: { order: number; number: number }) {
      tv.emit('draw:emerge', payload);
    },
    broadcastDrawLanded(payload: { order: number; number: number }) {
      tv.emit('draw:landed', payload);
    },
    broadcastRoundStart(meta: { roundSerial: number }) {
      tv.emit('round:start', meta);
    },
    broadcastSummary(meta: { roundSerial: number }) {
      tv.emit('summary:start', meta);
    },
    broadcastCountdown(sec: number) {
      tv.emit('countdown:start', { seconds: sec });
    },
  };
}
