import './styles.css';
import { SCENES } from './scenes/registry.js';
import { CinemaPlayer } from './engine/player.js';

const mountEl = document.getElementById('app');

if (mountEl) {
  const player = new CinemaPlayer(mountEl, SCENES);
  player.init();
}
