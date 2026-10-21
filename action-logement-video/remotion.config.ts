import {Config} from '@remotion/cli/config';

// Les fichiers fournis (logo, musique, SFX, polices) vivent dans assets/
Config.setPublicDir('./assets');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
