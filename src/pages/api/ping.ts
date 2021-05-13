import {NextApiHandler} from 'next';

export interface PingResponse {
  ping: 'pong';
  time: number;
}

const handler: NextApiHandler<PingResponse> = function (req, res) {
  res.json({
    ping: 'pong',
    time: Date.now(),
  });
};

export default handler;
