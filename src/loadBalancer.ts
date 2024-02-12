import { cpus } from 'os';
import cluster from 'cluster';

async function balancer() {
  if (cluster.isPrimary) {
    console.log(`Cpus: ${cpus().length}`);
    console.log(`Cluster pid is: ${process.pid}`);
    cpus().map(() => cluster.fork());
  } else {
    const id = cluster.worker?.id;
    console.log(`Worker: ${id}, pid: ${process.pid}`);
    await import('./index');
  }
}

balancer();
