export const config = {
  // Recipient Info
  recipient: {
    name: "pglu",           // Name for constellation
    nickname: "buddhu"      // Used in letter signature
  },

  // Memories (in order of appearance)
  memories: [
    {
      title: "How We Met",
      text: "That day changed everything... The way the light hit your face, I knew something special was beginning.",
    },
    {
      title: "Our First Adventure",
      text: "Remember when we got lost... but it didn't matter because we were together. We found that hidden cafe instead."
    },
    {
      title: "The Little Things",
      text: "Your laugh. The way you look when you're concentrating. The coffee you make in the mornings."
    },
    {
      title: "When I Messed Up",
      text: "I hurt you. There's no excuse... I wasn't listening when I should have been. I am truly sorry."
    },
    {
      title: "What You Mean To Me",
      text: "You're not just someone I love... you are my best friend, my confidant, and my home."
    },
    {
      title: "My Promise",
      text: "I promise to listen more... to be present, to be patient, and to cherish every moment we have."
    }
  ],

  // Love Letter
  letter: {
    content: `My dearest,

I've been sitting here, trying to find the right words...

I know things have been difficult lately, and I take responsibility for my part in that. This garden is a representation of my journey—from realizing my mistakes to understanding how much you mean to me.

Every flower here represents a memory I cherish. Every light represents the hope I have for us.

I want to grow with you, just like this garden. I want to weather the storms and bloom in the sun, together.

Always and completely,
Me`,
    signature: "— buddhu ❤️"
  },

  // Visual Customization
  theme: {
    accentColor: 0x88ccff,
    skyColorStart: 0x0a0a15,
    skyColorEnd: 0x2a1a3e
  },

  // Feature Toggles
  features: {
    audio: true,
    particles: true,
    autoRotate: true,
    fallingHearts: true
  }
};
