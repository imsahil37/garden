export const config = {
  // Recipient Info
  recipient: {
    name: "pglu",           // Update this to her actual name if you wish
    nickname: "buddhu"        // Used in letter signature
  },

  // Memories (Updated for the "Placement/Distance" context)
  memories: [
    {
      title: "The Beginning",
      text: "Remember those long nights we used to talk? That was when I realized I didn't just like you, I needed you.",
    },
    {
      title: "The Distance",
      text: "Then the world got loud. Placements, exams, pressure. I got lost in the noise and I stopped listening to the most important voice—yours."
    },
    {
      title: " The Silence",
      text: "I know I felt far away this last month. I know it felt like I ghosted you. It was the biggest mistake I've made."
    },
    {
      title: "The Fear",
      text: "When I saw you again, I was scared. Scared to hold your hand, scared to hug you. But seeing you reminded me of everything I was missing."
    },
    {
      title: "The Realization",
      text: "A career is nothing if I don't have my person to share it with. You are my person."
    },
    {
      title: "My Promise",
      text: "I'm back now. No more long silences. No more distance. Just us, growing together again."
    }
  ],

  // Love Letter - The Climax
  letter: {
    content: `Meri Pyari Pglu,

I've been struggling to find the right words to say this in person, so I built this garden for you instead.

I know I hurt you. I know the last month was cold and confusing. I got so focused on securing my future that I neglected my present—which is you.

When I tried to reach for you yesterday and you pulled away, it broke my heart, but I understood it. I earned that distance. But I want to earn back your closeness.

This garden represents us. It might have been neglected for a little while, but the roots are deep, and with a little light, it will bloom again.

Let me hold your hand again?`,
    signature: "— Your stupid boyfriend ❤️"
  },

  // Visual Customization (Kept original settings)
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
