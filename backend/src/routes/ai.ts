import { Router } from 'express';

const router = Router();

router.get('/optimal-times', async (req, res) => {
  const times: Record<string, any> = {
    Facebook: { days: ['Mardi','Mercredi','Jeudi','Vendredi'], hours: ['9h00','11h00','13h00','15h00'] },
    Instagram: { days: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'], hours: ['7h00','8h00','18h00','19h00','20h00'] },
    TikTok: { days: ['Mardi','Mercredi','Jeudi'], hours: ['18h00','19h00','20h00','21h00','22h00'] },
    YouTube: { days: ['Vendredi','Samedi','Dimanche'], hours: ['14h00','15h00','16h00','17h00','18h00'] },
    'X/Twitter': { days: ['Lundi','Mardi','Mercredi'], hours: ['8h00','9h00','10h00','18h00','19h00','20h00'] },
    LinkedIn: { days: ['Mardi','Mercredi','Jeudi'], hours: ['7h00','8h00','9h00','12h00','13h00','14h00'] },
    WhatsApp: { days: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'], hours: ['9h00','12h00','18h00','20h00'] },
    Messenger: { days: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'], hours: ['10h00','14h00','18h00'] },
    Spotify: { days: ['Lundi','Mercredi','Vendredi'], hours: ['6h00','7h00','12h00','17h00'] },
    Snapchat: { days: ['Vendredi','Samedi','Dimanche'], hours: ['10h00','14h00','20h00','21h00','22h00'] }
  };
  const { platform } = req.query;
  res.json(platform ? { [platform as string]: times[platform as string] } : times);
});

export default router;
