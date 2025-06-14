const { createApp, ref, computed, onMounted, watch } = Vue;

// Complete DECK data structure with all 54 cards and streaming links
const DECK = {
  // Diamonds
  "AD": {
    title: "Gimme Midnight (Ace of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/gimme-midnight-ace-of-diamonds",
    spotify: "https://open.spotify.com/track/7oLFNw70AQvkI6omvGNLyd",
    appleMusic: "https://music.apple.com/us/song/gimme-midnight-ace-of-diamonds/1800133021",
    youTubeMusic: "https://music.youtube.com/watch?v=djRIwJtkQYU"
  },
  "2D": {
    title: "Joke's on You (2 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/jokes-on-you-2-of-diamonds",
    spotify: "https://open.spotify.com/track/3RfkZORg6zBoU5Pw6WxQ4o",
    appleMusic: "https://music.apple.com/us/song/jokes-on-you-2-of-diamonds/1800133022",
    youTubeMusic: "https://music.youtube.com/watch?v=1i1aphiJkqw"
  },
  "3D": {
    title: "Fake Flowers at Sunset (3 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/fake-flowers-at-sunset-3-of-diamonds",
    spotify: "https://open.spotify.com/track/0VbcgLpUtoLr9zauRI0gpt",
    appleMusic: "https://music.apple.com/us/song/fake-flowers-at-sunset-feat-cassie-berman/1800133023",
    youTubeMusic: "https://music.youtube.com/watch?v=oq-EE36mIPk"
  },
  "4D": {
    title: "Rebuilding Year (4 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/rebuilding-year-4-of-diamonds",
    spotify: "https://open.spotify.com/track/63ef5Ncm3qnWsuGuGLDUBE",
    appleMusic: "https://music.apple.com/us/song/rebuilding-year-4-of-diamonds-feat-ezra-furman/1800133024",
    youTubeMusic: "https://music.youtube.com/watch?v=ZigPo0H23Qw"
  },
  "5D": {
    title: "Alone, in Love (5 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/alone-in-love-5-of-diamonds",
    spotify: "https://open.spotify.com/track/02Mmz2JwsZs6JBWYKRzs5f",
    appleMusic: "https://music.apple.com/us/song/alone-in-love-5-of-diamonds/1800133025",
    youTubeMusic: "https://music.youtube.com/watch?v=as8H2G-J230"
  },
  "6D": {
    title: "Grateful Dead Sweater (6 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/grateful-dead-sweater-6-of-diamonds",
    spotify: "https://open.spotify.com/track/25jSrkNuozcmekhcQxwwBq",
    appleMusic: "https://music.apple.com/us/song/grateful-dead-sweater-6-of-diamonds/1800133026",
    youTubeMusic: "https://music.youtube.com/watch?v=o8mWlX6Pvs0"
  },
  "7D": {
    title: "Too High to Say Hello (7 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/too-high-to-say-hello-7-of-diamonds",
    spotify: "https://open.spotify.com/track/7iEYSSIskfB3MLStMMbgLt",
    appleMusic: "https://music.apple.com/us/song/too-high-to-say-hello-7-of-diamonds/1800133027",
    youTubeMusic: "https://music.youtube.com/watch?v=1IHHIu1VY6g"
  },
  "8D": {
    title: "Superglued to You (8 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/superglued-to-you-8-of-diamonds",
    spotify: "https://open.spotify.com/track/6w03brJmsQdxCtBIb1xf21",
    appleMusic: "https://music.apple.com/us/song/superglued-to-you-8-of-diamonds-feat-lydia-loveless/1800133028",
    youTubeMusic: "https://music.youtube.com/watch?v=fT17BcmWvho"
  },
  "9D": {
    title: "Old Feelings, New England (9 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/old-feelings-new-england-9-of-diamonds",
    spotify: "https://open.spotify.com/track/6JjAbYFyXPVbRSRL0deeba",
    appleMusic: "https://music.apple.com/us/song/old-feelings-new-england-9-of-diamonds-feat-tanya-donelly/1800133029",
    youTubeMusic: "https://music.youtube.com/watch?v=UBbltT4fGRY"
  },
  "10D": {
    title: "Samantha, You're the Only Mistake I Know How to Make (10 of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/samantha-youre-the-only-mistake-i-know-how-to-make-10-of-diamonds",
    spotify: "https://open.spotify.com/track/1wNhggqK9brazNbXR9xc36",
    appleMusic: "https://music.apple.com/us/song/samantha-youre-the-only-mistake-i-know-how-to-make-10/1800133030",
    youTubeMusic: "https://music.youtube.com/watch?v=QI81LvMSLlQ"
  },
  "JD": {
    title: "This is a Song (Jack of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/this-is-a-song-jack-of-diamonds",
    spotify: "https://open.spotify.com/track/5oHZzMLCtaRx2kwKnbISeV",
    appleMusic: "https://music.apple.com/us/song/this-is-a-song-jack-of-diamonds/1800133031",
    youTubeMusic: "https://music.youtube.com/watch?v=Kx0pMRHTdXs"
  },
  "QD": {
    title: "Here Goes Nothing (Queen of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/here-goes-nothing-queen-of-diamonds",
    spotify: "https://open.spotify.com/track/0GotdFGfRPOXiwJmbvkjM9",
    appleMusic: "https://music.apple.com/us/song/here-goes-nothing-queen-of-diamonds-feat-titus-andronicus/1800133032",
    youTubeMusic: "https://music.youtube.com/watch?v=ChGM-RjzAYM"
  },
  "KD": {
    title: "Follow the Foreshadowing (King of Diamonds)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/follow-the-foreshadowing-king-of-diamonds",
    spotify: "https://open.spotify.com/track/6GG2aQXqRatwGLGQu0QETk",
    appleMusic: "https://music.apple.com/us/song/follow-the-foreshadowing-king-of-diamonds-feat/1800133033",
    youTubeMusic: "https://music.youtube.com/watch?v=be2mP35cA1I"
  },

  // Hearts
  "AH": {
    title: "Just Another Night on Planet Earth (Ace of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/just-another-night-on-planet-earth-ace-of-hearts",
    spotify: "https://open.spotify.com/track/07ppOe2y4ZdKHRaIu5OGNG",
    appleMusic: "https://music.apple.com/us/song/just-another-night-on-planet-earth-ace-of-hearts/1799918642",
    youTubeMusic: "https://music.youtube.com/watch?v=5vsiLK5f28Q"
  },
  "2H": {
    title: "Scream Into the Void (2 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/scream-into-the-void-2-of-hearts",
    spotify: "https://open.spotify.com/track/69eXd34RdgP4mQt1izdn1l",
    appleMusic: "https://music.apple.com/us/song/scream-into-the-void-2-of-hearts-feat-bong-wish/1799918643",
    youTubeMusic: "https://music.youtube.com/watch?v=E2mjr_pASeM"
  },
  "3H": {
    title: "I'll Get Over It (3 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/ill-get-over-it-3-of-hearts",
    spotify: "https://open.spotify.com/track/0paOjKlJnBeX1j7GmGYHz7",
    appleMusic: "https://music.apple.com/us/song/ill-get-over-it-3-of-hearts/1799918644",
    youTubeMusic: "https://music.youtube.com/watch?v=3tQwzQSLBIM"
  },
  "4H": {
    title: "Animals in Love (4 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/animals-in-love-4-of-hearts",
    spotify: "https://open.spotify.com/track/1LqKQdtTBv4fYWiwk0Dcq9",
    appleMusic: "https://music.apple.com/us/song/animals-in-love-4-of-hearts-feat-john-vanderslice/1799918645",
    youTubeMusic: "https://music.youtube.com/watch?v=scxCk1KW2QA"
  },
  "5H": {
    title: "Phantom Ring (5 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/phantom-ring-5-of-hearts",
    spotify: "https://open.spotify.com/track/3HBK908SjNIdEHtlcmskC0",
    appleMusic: "https://music.apple.com/us/song/phantom-ring-5-of-hearts/1799918646",
    youTubeMusic: "https://music.youtube.com/watch?v=DJEtemb-kd4"
  },
  "6H": {
    title: "Everest (6 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/everest-6-of-hearts",
    spotify: "https://open.spotify.com/track/1qq6Pk3WXnGI35FJoY8C6T",
    appleMusic: "https://music.apple.com/us/song/everest-6-of-hearts/1799918647",
    youTubeMusic: "https://music.youtube.com/watch?v=p0H4mRvW2_s"
  },
  "7H": {
    title: "The Loudest Sound (7 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/the-loudest-sound-7-of-hearts",
    spotify: "https://open.spotify.com/track/732vfwj5v26ovAM09h8hSE",
    appleMusic: "https://music.apple.com/us/song/the-loudest-sound-7-of-hearts/1799918648",
    youTubeMusic: "https://music.youtube.com/watch?v=_38MRj2jitQ"
  },
  "8H": {
    title: "Some Rest for the Wicked (8 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/some-rest-for-the-wicked-8-of-hearts",
    spotify: "https://open.spotify.com/track/5O2h1hGz0G3VyrTECrajVr",
    appleMusic: "https://music.apple.com/us/song/some-rest-for-the-wicked-8-of-hearts/1799918649",
    youTubeMusic: "https://music.youtube.com/watch?v=294_SAGZEd8"
  },
  "9H": {
    title: "You Can Never Go Home (9 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/you-can-never-go-home-9-of-hearts",
    spotify: "https://open.spotify.com/track/1yYImh7t3PSUZT2f5RUmVg",
    appleMusic: "https://music.apple.com/us/song/you-can-never-go-home-9-of-hearts/1799918650",
    youTubeMusic: "https://music.youtube.com/watch?v=75b2adtjhyQ"
  },
  "10H": {
    title: "The Night Machine (10 of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/the-night-machine-10-of-hearts",
    spotify: "https://open.spotify.com/track/6N6aKbAzwsaD1l6OBaNKOO",
    appleMusic: "https://music.apple.com/us/song/the-night-machine-10-of-hearts/1799918651",
    youTubeMusic: "https://music.youtube.com/watch?v=k06e0f9nX0c"
  },
  "JH": {
    title: "Something Great (Jack of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/something-great-jack-of-hearts",
    spotify: "https://open.spotify.com/track/0eO1WCljCHUv8DL3dQrB02",
    appleMusic: "https://music.apple.com/us/song/something-great-jack-of-hearts/1799918652",
    youTubeMusic: "https://music.youtube.com/watch?v=ZkDvpf73-wg"
  },
  "QH": {
    title: "Classic of the Genre (Queen of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/classic-of-the-genre-queen-of-hearts",
    spotify: "https://open.spotify.com/track/1SwtkTqv21ljrm0qtoIrMv",
    appleMusic: "https://music.apple.com/us/song/classic-of-the-genre-queen-of-hearts/1799918653",
    youTubeMusic: "https://music.youtube.com/watch?v=nmpezOJM5UM"
  },
  "KH": {
    title: "Feels Like Forever (King of Hearts)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/feels-like-forever-king-of-hearts",
    spotify: "https://open.spotify.com/track/69SiBrfoE7E3l650DXqtjx",
    appleMusic: "https://music.apple.com/us/song/feels-like-forever-king-of-hearts/1799918654",
    youTubeMusic: "https://music.youtube.com/watch?v=zTnH9KwM4xM"
  },

  // Clubs
  "AC": {
    title: "Uncanny Valley (Ace of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/uncanny-valley-ace-of-clubs",
    spotify: "https://open.spotify.com/track/0VMmoRjIh0mUB7uBn8vzCG",
    appleMusic: "https://music.apple.com/us/song/uncanny-valley-ace-of-clubs-feat-sad13/1799855742",
    youTubeMusic: "https://music.youtube.com/watch?v=u-QfaJFiOiw"
  },
  "2C": {
    title: "Burn this Atlas Down (2 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/burn-this-atlas-down-2-of-clubs",
    spotify: "https://open.spotify.com/track/41u84b3dGE0yfs5NKMFIon",
    appleMusic: "https://music.apple.com/us/song/burn-this-atlas-down-2-of-clubs-feat-craig-finn/1799855743",
    youTubeMusic: "https://music.youtube.com/watch?v=BIrCcNS-vis"
  },
  "3C": {
    title: "Camouflage Band-Aid (3 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/camouflage-band-aid-3-of-clubs",
    spotify: "https://open.spotify.com/track/5fBHkjBC2wPoMY6j8fw0qa",
    appleMusic: "https://music.apple.com/us/song/camouflage-band-aid-3-of-clubs/1799855744",
    youTubeMusic: "https://music.youtube.com/watch?v=rXTFxBl2zL0"
  },
  "4C": {
    title: "I'm Your Meteorite (4 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/im-your-meteorite-4-of-clubs",
    spotify: "https://open.spotify.com/track/7KOFbPnvJf3ggEUyK7ub2U",
    appleMusic: "https://music.apple.com/us/song/im-your-meteorite-4-of-clubs/1799855745",
    youTubeMusic: "https://music.youtube.com/watch?v=Gei2XQV_DrU"
  },
  "5C": {
    title: "Crush All Night (5 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/crush-all-night-5-of-clubs",
    spotify: "https://open.spotify.com/track/71thMJysuYuuO6fbF4CfUz",
    appleMusic: "https://music.apple.com/us/song/crush-all-night-5-of-clubs-feat-sad13/1799855746",
    youTubeMusic: "https://music.youtube.com/watch?v=R3G3ihOaqkI"
  },
  "6C": {
    title: "Camera Click (6 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/camera-click-6-of-clubs",
    spotify: "https://open.spotify.com/track/0fqNvteYsYyTQpnmZ8I72w",
    appleMusic: "https://music.apple.com/us/song/camera-click-6-of-clubs/1799855747",
    youTubeMusic: "https://music.youtube.com/watch?v=o09zACpjuqA"
  },
  "7C": {
    title: "FugaziBlackHoleMirage (7 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/fugaziblackholemirage-7-of-clubs",
    spotify: "https://open.spotify.com/track/01DJqZ97PpNVaISk3i8qXb",
    appleMusic: "https://music.apple.com/us/song/fugaziblackholemirage-7-of-clubs/1799855749",
    youTubeMusic: "https://music.youtube.com/watch?v=R8g1NoIjd-s"
  },
  "8C": {
    title: "My Past Is Your Futurism (8 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/my-past-is-your-futurism-8-of-clubs",
    spotify: "https://open.spotify.com/track/6wnuxbTcqOLSpiNWmar7gW",
    appleMusic: "https://music.apple.com/us/song/my-past-is-your-futurism-8-of-clubs-feat-devin-davis/1799856080",
    youTubeMusic: "https://music.youtube.com/watch?v=9QVJ_H9rSJI"
  },
  "9C": {
    title: "Failure's my Fuel (9 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/failures-my-fuel-9-of-clubs",
    spotify: "https://open.spotify.com/track/6gYPRSZYPp2Zz0nH3hcjzM",
    appleMusic: "https://music.apple.com/us/song/failures-my-fuel-9-of-clubs/1799856081",
    youTubeMusic: "https://music.youtube.com/watch?v=HkzhAUhyxV4"
  },
  "10C": {
    title: "I'm your Palindrome (10 of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/im-your-palindrome-10-of-clubs",
    spotify: "https://open.spotify.com/track/5VFLJwMFfOsqVGpATr247k",
    appleMusic: "https://music.apple.com/us/song/im-your-palindrome-10-of-clubs-feat-kiwi-jr/1799856082",
    youTubeMusic: "https://music.youtube.com/watch?v=af5-s3aeuAM"
  },
  "JC": {
    title: "Modern Loss (Jack of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/modern-loss-jacks-of-clubs",
    spotify: "https://open.spotify.com/track/2vRPutgQGRrkR8WwzUYbDX",
    appleMusic: "https://music.apple.com/us/song/modern-loss-jack-of-clubs/1799856083",
    youTubeMusic: "https://music.youtube.com/watch?v=ww-2_wEK6ks"
  },
  "QC": {
    title: "Fade to White (Queen of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/fade-to-white-queen-of-clubs",
    spotify: "https://open.spotify.com/track/4hTnvhCMaL8j0Fyt9LHFZB",
    appleMusic: "https://music.apple.com/us/song/fade-to-white-queen-of-clubs/1799856084",
    youTubeMusic: "https://music.youtube.com/watch?v=lZda1S-Uyz4"
  },
  "KC": {
    title: "I Remember This (King of Clubs)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/i-remember-this-king-of-clubs",
    spotify: "https://open.spotify.com/track/3D9wFNE4nk7vcEZ8P2CXNs",
    appleMusic: "https://music.apple.com/us/song/i-remember-this-king-of-clubs/1799856085",
    youTubeMusic: "https://music.youtube.com/watch?v=kRZuE-ZACok"
  },

  // Spades
  "AS": {
    title: "This is Not a Dream (Ace of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/this-is-not-a-dream-ace-of-spades",
    spotify: "https://open.spotify.com/track/4pGBIZtak0psYwGjTCEcAo",
    appleMusic: "https://music.apple.com/us/song/this-is-not-a-dream-ace-of-spades/1799939333",
    youTubeMusic: "https://music.youtube.com/watch?v=YEbF6Me2H5A"
  },
  "2S": {
    title: "It's Undeniable (2 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/it-s-undeniable-2-of-spades",
    spotify: "https://open.spotify.com/track/5geTHuAsc2CjKwrqD7kzF0",
    appleMusic: "https://music.apple.com/us/song/its-undeniable-2-of-spades/1799939334",
    youTubeMusic: "https://music.youtube.com/watch?v=Ds7YsHa0YmU"
  },
  "3S": {
    title: "Divine Interventions (3 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/divine-interventions-3-of-spades",
    spotify: "https://open.spotify.com/track/2kLL5lJZ01wgEymDRohZUU",
    appleMusic: "https://music.apple.com/us/song/divine-interventions-3-of-spades/1799939335",
    youTubeMusic: "https://music.youtube.com/watch?v=CFeWZTPoHak"
  },
  "4S": {
    title: "I Did My Own Stunts (4 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/i-did-my-own-stunts-4-of-spades",
    spotify: "https://open.spotify.com/track/2yIvz7AAcg1IVd0B5Jp28d",
    appleMusic: "https://music.apple.com/us/song/i-did-my-own-stunts-4-of-spades-feat-clint-conley/1799939336",
    youTubeMusic: "https://music.youtube.com/watch?v=BC0yvJq59II"
  },
  "5S": {
    title: "The World is Not What You Think It Is (5 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/the-world-is-not-what-you-think-it-is-5-of-spades",
    spotify: "https://open.spotify.com/track/1pHjRhgtf3230lEnPMouQN",
    appleMusic: "https://music.apple.com/us/song/the-world-is-not-what-you-think-it-is-5-of-spades/1799939337",
    youTubeMusic: "https://music.youtube.com/watch?v=qWKOBxify2Y"
  },
  "6S": {
    title: "The Feeling is Mine (6 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/the-feeling-is-mine-6-of-spades",
    spotify: "https://open.spotify.com/track/27tH5vneQdfcuu8BSgAups",
    appleMusic: "https://music.apple.com/us/song/the-feeling-is-mine-6-of-spades-feat-bong-wish/1799939338",
    youTubeMusic: "https://music.youtube.com/watch?v=HD_0Fbg0qiU"
  },
  "7S": {
    title: "I Got Out of This World Alive (7 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/i-got-out-of-this-world-alive-7-of-spades",
    spotify: "https://open.spotify.com/track/4jkoDFbK7UHBS5iNuEpODf",
    appleMusic: "https://music.apple.com/us/song/i-got-out-of-this-world-alive-7-of-spades/1799939340",
    youTubeMusic: "https://music.youtube.com/watch?v=FCodDDGAf_s"
  },
  "8S": {
    title: "I'm Your Tambourine (8 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/i-m-your-tambourine-8-of-spades",
    spotify: "https://open.spotify.com/track/5UxWlcgMaBILcjJzqZkfgh",
    appleMusic: "https://music.apple.com/us/song/im-your-tambourine-8-of-spades/1799939341",
    youTubeMusic: "https://music.youtube.com/watch?v=MaowuU578gY"
  },
  "9S": {
    title: "Hits Get Hard (9 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/hits-get-hard-9-of-spades",
    spotify: "https://open.spotify.com/track/1ZhjQuB4AYNOQD5Q5Orc2U",
    appleMusic: "https://music.apple.com/us/song/hits-get-hard-9-of-spades/1799939342",
    youTubeMusic: "https://music.youtube.com/watch?v=nLDQ3EIsHsg"
  },
  "10S": {
    title: "No One Remembers Their Names (10 of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/no-one-remembers-their-names-10-of-spades",
    spotify: "https://open.spotify.com/track/11024zfFPAPo8QISUa5Mz6",
    appleMusic: "https://music.apple.com/us/song/no-one-remembers-their-names-10-of-spades/1799939343",
    youTubeMusic: "https://music.youtube.com/watch?v=pqdOkTlnItA"
  },
  "JS": {
    title: "A Lot of Super Weird Stuff Went Down Right Before I Met You (Jack of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/a-lot-of-super-weird-stuff-went-down-right-before-i-met-you-jack-of-spades",
    spotify: "https://open.spotify.com/track/1SshkURMhfWPH6HFPPh6xq",
    appleMusic: "https://music.apple.com/us/song/a-lot-of-super-weird-stuff-went-down-right-before/1799939344",
    youTubeMusic: "https://music.youtube.com/watch?v=FuRZFq2YYMI"
  },
  "QS": {
    title: "The End is Just Beginning (Queen of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/the-end-is-just-beginning-queen-of-spades",
    spotify: "https://open.spotify.com/track/4bwyq7ilgt0ZTMMHaIsr9t",
    appleMusic: "https://music.apple.com/us/song/the-end-is-just-beginning-queen-of-spades/1799939345",
    youTubeMusic: "https://music.youtube.com/watch?v=dAmVTba2i3U"
  },
  "KS": {
    title: "Places, Everybody (King of Spades)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/places-everybody-king-of-spades",
    spotify: "https://open.spotify.com/track/5hdJkjObuc62tR3FsMvPn4",
    appleMusic: "https://music.apple.com/us/song/places-everybody-king-of-spades/1799939346",
    youTubeMusic: "https://music.youtube.com/watch?v=HdbnuFtgIZo"
  },

  // Jokers
  "J1": {
    title: "Untitled, Actual Title (Joker One)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/untitled-actual-title-joker-1",
    spotify: "https://open.spotify.com/track/1hXVzAZRd93L2fXSADOSWY",
    appleMusic: "https://music.apple.com/us/song/untitled-actual-title-joker-1/1812900564",
    youTubeMusic: "https://music.youtube.com/watch?v=LMl8l-nZNNo"
  },
  "J2": {
    title: "Actual Title, Untitled (Joker Two)",
    bandcamp: "https://hallelujahthehills.bandcamp.com/track/actual-title-untitled-joker-2",
    spotify: "https://open.spotify.com/track/7jiXE9FZbtxRyH2XefiNEn",
    appleMusic: "https://music.apple.com/us/song/actual-title-untitled-joker-2/1812900565",
    youTubeMusic: "https://music.youtube.com/watch?v=AwYi1TsooCs"
  }
};

// Deck Component
const DeckComponent = {
  props: ['remainingCards', 'isDisabled', 'hasCards', 'streamingPreference'],
  emits: ['draw-card', 'new-pull', 'update-preference'],  template: `
    <div class="deck-container">
      <div
        class="deck"
        :class="{ disabled: isDisabled }"
        @click="handleDeckClick"
      >
      </div>

      <div v-if="hasCards" class="deck-controls">
        <div class="action-icons">
          <div class="share-button-container">
            <button
              class="action-icon-btn"
              @click="copyUrlToClipboard"
              title="Copy link to share"
            >
              <i class="fas fa-link"></i>
            </button>
            <div v-if="showCopiedFeedback" class="copy-tooltip">
              Link copied!
            </div>
          </div>
          <button
            class="action-icon-btn"
            @click="$emit('new-pull')"
            title="Start again"
          >
            <i class="fas fa-redo"></i>
          </button>
          <button
            class="action-icon-btn"
            @click="showInfoModal = true"
            title="About DECK"
          >
            <i class="fas fa-question"></i>
          </button>
        </div>
        <div class="streaming-selector">
          <div class="streaming-label">Open songs on:</div>
          <div class="streaming-icons">
            <button
              v-for="service in services"
              :key="service.value"
              class="streaming-icon-btn"
              :class="{ active: streamingPreference === service.value }"
              @click="$emit('update-preference', service.value)"
              :title="service.name"
            >
              <i :class="service.icon"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Modal -->
    <div v-if="showInfoModal" class="modal-overlay" @click="showInfoModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showInfoModal = false">
          <i class="fas fa-times"></i>
        </button>
        <p><a href="https://www.hallelujahthehills.com/music/deck/" target="_blank" rel="noopener noreferrer">DECK</a> is 3.5+ hours of music from Hallelujah The Hills. DECK is 4 albums released in one day. DECK is an actual deck of playing cards with a visual design meant to reflect the song it corresponds to. DECK is an invitation to listeners to craft their own musical/visual experience however they wish to do so.</p>
        <img width="360" height="360" src="https://res.cloudinary.com/dgojqlr7m/image/fetch/c_fill,w_360/https://res.cloudinary.com/dgojqlr7m/image/upload/v1742949999/DECK_4_panel.jpg" alt="DECK Album Art">
        <p>All artwork by Ryan H. Walsh.</p>
        </div>
    </div>
  `,
  data() {
    return {
      showCopiedFeedback: false,
      showInfoModal: false,
      services: [
        { value: 'bandcamp', name: 'Bandcamp', icon: 'fab fa-bandcamp' },
        { value: 'spotify', name: 'Spotify', icon: 'fab fa-spotify' },
        { value: 'appleMusic', name: 'Apple Music', icon: 'fab fa-apple' },
        { value: 'youTubeMusic', name: 'YouTube Music', icon: 'fab fa-youtube' }
      ]
    };
  },
  methods: {
    handleDeckClick() {
      if (!this.isDisabled) {
        this.$emit('draw-card');
      }
    },
    async copyUrlToClipboard() {
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.showCopiedFeedback = true;
        setTimeout(() => {
          this.showCopiedFeedback = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy URL to clipboard:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopiedFeedback = true;
        setTimeout(() => {
          this.showCopiedFeedback = false;
        }, 2000);
      }
    }
  }
};

// Card List Component
const CardList = {
  props: ['drawnCards', 'getPreferredStreamingUrl', 'streamingPreference'],
  template: `
    <div>
      <div class="card-grid" v-if="drawnCards.length > 0">
        <a
          v-for="(card, index) in drawnCards"
          :key="card.code"
          class="card-grid-item clickable-card"
          :ref="'card-' + index"
          :href="getPreferredStreamingUrl(card)"
          target="_blank"
          rel="noopener noreferrer"
          :title="getCardTitle(card)"
        >
          <img
            :src="'./cards/' + card.code + '.jpg'"
            :alt="card.title"
            class="card-image"
          />
          <div class="card-content">
            <div class="card-title clickable-title">
              {{ index + 1 }}. {{ getSongName(card.title) }}
              <span class="card-name">{{ getCardName(card.title) }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
  methods: {
    getSongName(title) {
      const parenIndex = title.lastIndexOf('(');
      return parenIndex !== -1 ? title.substring(0, parenIndex).trim() : title;
    },
    getCardName(title) {
      const parenIndex = title.lastIndexOf('(');
      return parenIndex !== -1 ? ' ' + title.substring(parenIndex) : '';
    },
    getCardTitle(card) {
      const serviceNames = {
        'bandcamp': 'Bandcamp',
        'spotify': 'Spotify',
        'appleMusic': 'Apple Music',
        'youTubeMusic': 'YouTube Music'
      };
      const serviceName = serviceNames[this.streamingPreference] || 'your preferred streaming service';
      return `Open on ${serviceName}`;
    },
    scrollToLatestCard() {
      this.$nextTick(() => {
        const lastIndex = this.drawnCards.length - 1;
        const lastCardRef = this.$refs['card-' + lastIndex];
        if (lastCardRef) {
          // In Vue 3, refs don't return arrays for single elements
          const element = Array.isArray(lastCardRef) ? lastCardRef[0] : lastCardRef;
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      });
    }
  }
};

// Main Vue App
const App = {
  components: {
    DeckComponent,
    CardList
  },
  setup() {
    const drawnCards = ref([]);
    const cardListRef = ref(null);
    const streamingPreference = ref('bandcamp'); // Default to Bandcamp

    // Get all available card codes
    const allCardCodes = Object.keys(DECK);

    const remainingCards = computed(() => {
      return allCardCodes.length - drawnCards.value.length;
    });

    const hasCards = computed(() => {
      return drawnCards.value.length > 0;
    });

    // Load streaming preference from localStorage
    const loadStreamingPreference = () => {
      try {
        const saved = localStorage.getItem('streamingPreference');
        if (saved && ['spotify', 'appleMusic', 'youTubeMusic', 'bandcamp'].includes(saved)) {
          streamingPreference.value = saved;
        }
      } catch (error) {
        console.error('Error loading streaming preference:', error);
      }
    };

    // Save streaming preference to localStorage
    const saveStreamingPreference = (preference) => {
      try {
        streamingPreference.value = preference;
        localStorage.setItem('streamingPreference', preference);
      } catch (error) {
        console.error('Error saving streaming preference:', error);
      }
    };

    // Get URL for preferred streaming service
    const getPreferredStreamingUrl = (card) => {
      const urlMap = {
        'spotify': card.spotify,
        'appleMusic': card.appleMusic,
        'youTubeMusic': card.youTubeMusic,
        'bandcamp': card.bandcamp
      };
      return urlMap[streamingPreference.value] || card.bandcamp || card.spotify || card.appleMusic || card.youTubeMusic;
    };

    // Update URL parameters
    const updateURL = () => {
      try {
        const url = new URL(window.location);
        if (drawnCards.value.length > 0) {
          const cardCodes = drawnCards.value.map(card => card.code).join('');
          // Limit URL length to prevent browser issues
          if (cardCodes.length < 200) {
            url.searchParams.set('cards', cardCodes);
          }
        } else {
          url.searchParams.delete('cards');
        }
        window.history.replaceState({}, '', url);
      } catch (error) {
        console.warn('URL update error (non-critical):', error);
      }
    };

    // Load pull from URL or card codes
    const loadPullFromCodes = (cardCodes) => {
      const validCards = cardCodes
        .filter(code => DECK[code])
        .map(code => ({
          code,
          ...DECK[code]
        }));

      drawnCards.value = validCards;
    };

    // Load pull from URL parameters
    const loadFromURL = () => {
      try {
        const url = new URL(window.location);
        const cardsParam = url.searchParams.get('cards');
        if (cardsParam && cardsParam.length < 200) {
          // Parse card codes from concatenated string
          const cardCodes = [];
          let i = 0;
          while (i < cardsParam.length) {
            // Try 3-character code first (for 10s)
            if (i + 2 < cardsParam.length) {
              const code3 = cardsParam.substring(i, i + 3);
              if (DECK[code3]) {
                cardCodes.push(code3);
                i += 3;
                continue;
              }
            }
            // Try 2-character code
            if (i + 1 < cardsParam.length) {
              const code2 = cardsParam.substring(i, i + 2);
              if (DECK[code2]) {
                cardCodes.push(code2);
                i += 2;
                continue;
              }
            }
            // Skip invalid character
            i++;
          }
          loadPullFromCodes(cardCodes);
        }
      } catch (error) {
        console.warn('URL parsing error (non-critical):', error);
      }
    };

    // Draw a random card
    const drawCard = () => {
      try {
        if (drawnCards.value.length >= 13) return;

        const drawnCodes = drawnCards.value.map(card => card.code);
        const availableCodes = allCardCodes.filter(code => !drawnCodes.includes(code));

        if (availableCodes.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableCodes.length);
        const selectedCode = availableCodes[randomIndex];

        const newCard = {
          code: selectedCode,
          ...DECK[selectedCode]
        };

        drawnCards.value.push(newCard);

        // Scroll to the newly drawn card with error handling
        setTimeout(() => {
          try {
            if (cardListRef.value && cardListRef.value.scrollToLatestCard) {
              cardListRef.value.scrollToLatestCard();
            }
          } catch (scrollError) {
            console.warn('Scroll error (non-critical):', scrollError);
          }
        }, 100);
      } catch (error) {
        console.error('Error drawing card:', error);
        // Don't reset the app, just log the error
      }
    };

    // Start a new pull
    const startNewPull = () => {
      drawnCards.value = [];
    };

    // Watch for changes to update URL (with throttling to prevent excessive updates)
    let urlUpdateTimeout = null;
    watch(drawnCards, () => {
      if (urlUpdateTimeout) {
        clearTimeout(urlUpdateTimeout);
      }
      urlUpdateTimeout = setTimeout(() => {
        updateURL();
      }, 300); // Throttle URL updates
    }, { deep: true });

    // Initialize on mount
    onMounted(() => {
      loadFromURL();
      loadStreamingPreference();
    });

    return {
      drawnCards,
      remainingCards,
      hasCards,
      drawCard,
      startNewPull,
      cardListRef,
      streamingPreference,
      saveStreamingPreference,
      getPreferredStreamingUrl
    };
  }
};

// Create and mount the app
const app = createApp(App);

// Add global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err);
  console.error('Error info:', info);
  // Don't let errors crash the app
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

app.mount('#app');
