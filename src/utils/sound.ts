// Base64 encoded notification beep sound (short, clean, non-intrusive beep)
import notificationSound from '../apple-iphone-notification.mp3';

export const playNotificationSound = (silent = false) => {
  try {
    const audio = new Audio(notificationSound);
    audio.volume = silent ? 0 : 0.5;
    audio.play().catch(e => {
      if (!silent) console.log('Audio playback prevented by browser policy', e);
    });
  } catch (error) {
    if (!silent) console.error('Error playing notification sound:', error);
  }
};
