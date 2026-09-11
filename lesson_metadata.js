/**
 * Curriculum metadata for A Course in Contemporary Chinese (Books 1 & 2).
 * Book 1 transcribed from official textbook Highlights of Lessons.
 * Book 2 compiled from textbook curriculum and grammar syllabus.
 */
const LESSON_METADATA = {
  1: {
    1: {
      title: "Welcome to Taiwan!",
      objectives: [
        "Learning simple greetings.",
        "Learning simple phrases to introduce people.",
        "Learning simple phrases to discuss likes/dislikes.",
        "Learning simple phrases to express gratitude."
      ],
      grammar: [
        "Ways to Ask Questions in Chinese (A-not-A, 嗎 ma)",
        "Answering Questions in Chinese (Affirmative replies, Negative replies with 不 bù)",
        "Modification Marker 很 hěn",
        "Contrastive Questions with 呢 ne"
      ]
    },
    2: {
      title: "My Family",
      objectives: [
        "Learning to talk about people in my family members and their names.",
        "Learning to describe people, places, and possessions.",
        "Learning to talk about the number of people in a family."
      ],
      grammar: [
        "的 de possessive",
        "Modifier Marker 的 de",
        "有 yǒu possessive",
        "都 dōu totality",
        "Measures 個 ge and 張 zhāng"
      ]
    },
    3: {
      title: "What Are You Doing Over the Weekend?",
      objectives: [
        "Learning to describe likes/dislikes (e.g., sports and movies).",
        "Learning to express what two groups have in common.",
        "Learning to politely ask others their opinions and make simple suggestions.",
        "Learning to form choice questions."
      ],
      grammar: [
        "Placement of Time Words",
        "To Go Do Something with 去 qù",
        "Topic Sentences",
        "The Word Order of Adverbs 也 yě, 都 dōu and 常 cháng",
        "Making Suggestions 吧 ba"
      ]
    },
    4: {
      title: "Excuse Me. How Much Does That Cost in Total?",
      objectives: [
        "Learning to ask and talk about prices.",
        "Learning to ask for reasons.",
        "Learning to use simple phrases to describe the size and function of common objects."
      ],
      grammar: [
        "Measures 塊 kuài, 杯 bēi, 支 zhī and 種 zhǒng",
        "Preposition 幫 bāng on behalf of",
        "的 De-phrase with the Head Noun Omitted",
        "太 tài...了 le overly",
        "能 néng capability",
        "多 duō ...and more"
      ]
    },
    5: {
      title: "Beef Noodles Are Really Delicious",
      objectives: [
        "Learning the names of common foods and describing their taste.",
        "Learning to express likes for and make simple comments about food.",
        "Learning to describe what somebody can/can't do and how well one does it.",
        "Learning to ask for help."
      ],
      grammar: [
        "有一點 yǒu yìdiǎn slightly",
        "Complement Marker 得 de",
        "Acquired Skills 會 huì",
        "Destination Marker 到 dào"
      ]
    },
    6: {
      title: "Their School Is Up in the Mountains",
      objectives: [
        "Learning to describe locations (e.g., near or far).",
        "Learning to talk about place in the vicinity of other places.",
        "Learning to make simple comments about the appearance of a place."
      ],
      grammar: [
        "Locative Marker 在 zài",
        "Existential Sentence with 有 yǒu",
        "Softened Action V (一) V",
        "不是 búshì Negation",
        "Location of an Activity"
      ]
    },
    7: {
      title: "Going to KTV at 9 O'clock in the Morning",
      objectives: [
        "Learning to tell and ask about time.",
        "Learning to describe an activity that takes place at a point in time (time-when) or during a certain frame (time-duration).",
        "Learning to make appointments with friends.",
        "Learning to talk about habitual activities."
      ],
      grammar: [
        "Time and Place of Events",
        "從 cóng... 到 dào... from A to B",
        "Progressive, On-going Actions 在 zài",
        "每 měi each and every",
        "可以 kěyǐ permission"
      ]
    },
    8: {
      title: "Taking a Train to Tainan",
      objectives: [
        "Learning the names of different types of transportation and talking about getting to destinations.",
        "Learning to talk about someone's plans for their free time.",
        "Learning to make simple comparisons about various modes of transportation.",
        "Learning to explain likes and dislikes."
      ],
      grammar: [
        "Companionship with 跟 gēn",
        "Asking How with 怎麼 zěnme",
        "Implicit Comparison with 比較 bǐjiào",
        "又 yòu... 又 yòu... both A and B",
        "Comparison with 比 bǐ"
      ]
    },
    9: {
      title: "Where Will You Go for the Holidays?",
      objectives: [
        "Learning to use time expressions to describe events.",
        "Learning to discuss travel plans with friends.",
        "Learning to talk about hypothetical situations.",
        "Learning to give suggestions about leisure activities."
      ],
      grammar: [
        "Time-When vs. Time-Duration",
        "Time-Duration 'for a period of time'",
        "…的時候 de shíhòu when",
        "有時候 yǒushíhòu… 有時候 yǒushíhòu… sometimes… sometimes…",
        "Condition and Consequence with 要是 yàoshì… 就 jiù…"
      ]
    },
    10: {
      title: "The Fruit in Taiwan Tastes Really Good",
      objectives: [
        "Learning to give simple descriptions of someone's appearance.",
        "Learning to describe the color, smell, and taste of food.",
        "Learning to briefly explain and give reasons.",
        "Learning to describe tentative activities and changeable states."
      ],
      grammar: [
        "V V 看看 kàn to try and see",
        "Intensification with Reduplicated State Verbs",
        "Clause as Modifiers of Nouns",
        "Change in Situation with Sentential 了 le",
        "Cause and Effect with 因為 yīnwèi…, 所以 suǒyǐ…"
      ]
    },
    11: {
      title: "I Would Like to Rent a Place",
      objectives: [
        "Learning to talk about renting a place to live.",
        "Learning to talk about environment of a room or a house.",
        "Learning to make requests, e.g., to one's landlord."
      ],
      grammar: [
        "To Come to Do Something with 來 lái",
        "Sooner Than Expected with 就 jiù",
        "Existential Subject with 有 yǒu",
        "Different Types of 會 huì",
        "Omitting Nouns at 2nd Mention"
      ]
    },
    12: {
      title: "How Long Will You Be Studying Chinese in Taiwan?",
      objectives: [
        "Learning to discuss study plans and future plans.",
        "Learning to talk about sequences of events.",
        "Learning to describe past actions and experience."
      ],
      grammar: [
        "先 xiān… 再 zài… first…, and then…",
        "To Focus with 是 shì… 的 de",
        "以後 yǐhòu after…",
        "Special Meanings of 好 hǎo / 難 nán + Verbs"
      ]
    },
    13: {
      title: "Happy Birthday",
      objectives: [
        "Learning to make appointments on the phone.",
        "Learning to ask friends about their dietary preferences.",
        "Learning to compare cultures.",
        "Learning to express wishes to others on special occasions and to respond appropriately when others offer you wishes on special occasions."
      ],
      grammar: [
        "一 yī… 就 jiù… ...as soon as...",
        "Completed Action with Verbal 了 le",
        "不 Negation vs. 沒 Negation",
        "All-inclusive with Question Words",
        "More / less… Than Planned with 多 duō / 少 shǎo + Verb…",
        "是不是 shìbúshì is it true?",
        "Comparison with 跟 gēn… 一樣 yíyàng"
      ]
    },
    14: {
      title: "It's So Cold!",
      objectives: [
        "Learning to talk about weather conditions, including typhoons.",
        "Learning to talk about the four seasons and explain why you like or dislike them.",
        "Learning to compare events.",
        "Learning to make simple statements about experiences, e.g., trips."
      ],
      grammar: [
        "Time-Duration after Verbal 了 le",
        "Completion-to-date with Double 了 le",
        "快 kuài… 了 le about to",
        "Comparison 更 gèng even more so",
        "Inferior Comparison 沒有 méiyǒu…"
      ]
    },
    15: {
      title: "I Don't Feel Well",
      objectives: [
        "Learning to ask someone how they are feeling.",
        "Learning to describe symptoms in simple terms.",
        "Learning to give suggestions to somebody who is sick.",
        "Learning to reject or accept suggestions."
      ],
      grammar: [
        "Non-committal Stance with Question Words",
        "To Dispose of Something with 把 bǎ",
        "V 了 le… 就 jiù… do… right after doing…",
        "一點 yìdiǎn a bit",
        "Comparing Actions with a 得 de Complement",
        "Complements of Degree in Comparison Structures",
        "Separable Verbs"
      ]
    }
  },
  2: {
    1: {
      title: "Excuse Me. How Do You Get to Shida?",
      objectives: [
        "Learning to ask for directions.",
        "Learning to talk about locations and give directions.",
        "Learning to describe events that involve two concurrent actions.",
        "Learning to express sensory feelings."
      ],
      grammar: [
        "從 cóng…往 wàng… go…from…",
        "Judgmental V-起來 qǐlái it's my assessment that…",
        "Ongoing Action with 著 zhe",
        "Two Simultaneously Actions with 一邊 yībiān…一邊 yībiān…",
        "Distance from with 離 lí…"
      ]
    },
    2: {
      title: "Take the MRT Instead!",
      objectives: [
        "Learning to describe public transportation in Taiwan.",
        "Learning to ask and answer questions about modes of transportation to designated places.",
        "Learning to compare, explain, and choose suitable means of transportation.",
        "Learning to express comparisons, warnings, and suggestions."
      ],
      grammar: [
        "Emphatic Negation with 一點也不 yīdiǎn yě bù V…",
        "還是 háishì…吧 ba ! It will be better if …",
        "Form Adverbials with 一點 yīdiǎn",
        "Reduplication of Disyllabic Adjectives",
        "不太 bútài not very",
        "Locations with 部 bù / 邊 biān"
      ]
    },
    3: {
      title: "Your Chinese Has Improved!",
      objectives: [
        "Learning to talk about past experiences.",
        "Learning to talk about my language learning experience.",
        "Learning to express my views on language learning.",
        "Learning to talk about my daily schedule and what I do on holidays."
      ],
      grammar: [
        "Various Functions of 差不多 chàbùduō",
        "Experience Particle 過 guò",
        "才 cái merely, only",
        "想起來 xiǎng qǐlái to have remembered",
        "Longer/Later Than Expected with 才 cái",
        "Tentative Action with Reduplicated Disyllabic Verbs ABAB"
      ]
    },
    4: {
      title: "I Work Part-time. I Teach French.",
      objectives: [
        "Learning to talk about my education background and working experiences.",
        "Learning to talk about the ideal job, its responsibilities and salary.",
        "Learning to ask questions related to job responsibilities.",
        "Learning to list at least two things or areas of expertise."
      ],
      grammar: [
        "除了 chúle…，還 hái… in addition to…",
        "按照 ànzhào… in accordance with",
        "Various Meaning of the Preposition 跟 gēn",
        "Various Meanings of 給 gěi",
        "對 duì… towards…"
      ]
    },
    5: {
      title: "Attending a Wedding Reception",
      objectives: [
        "Learning to understand Taiwanese wedding traditions.",
        "Learning to describe the way people dress and appear at a wedding reception.",
        "Learning to introduce people to others.",
        "Learning to congratulate newlyweds."
      ],
      grammar: [
        "還 hái still",
        "Manner of an Action with V著 zhe",
        "Multiple Verb Phrases in a Sentence",
        "When A comes, then B…with 等 děng…就 jiù…",
        "While doing A, B happens with V著 zhe V著 zhe，就 jiù…了 le"
      ]
    },
    6: {
      title: "I Plan to Move Closer to School",
      objectives: [
        "Learning to talk about living environments.",
        "Learning to talk about and negotiate rent.",
        "Learning to describe moving objects.",
        "Learning to ask and answer hypothetical questions."
      ],
      grammar: [
        "Destination Marker 到 dào",
        "Indirect Object Marker 給 gěi",
        "Resultant Location with V+在 zài…",
        "Moving an Object to a Location with 把 bǎ",
        "而且 érqiě furthermore"
      ]
    },
    7: {
      title: "The Garbage Truck Is Here!",
      objectives: [
        "Learning to express my views on new things and events.",
        "Learning to express my understanding of cultural differences.",
        "Learning to give advice and inform of possible consequences.",
        "Learning to use directional verbs in expressions."
      ],
      grammar: [
        "Directional Constructions V₁V₂ and V₁V₂V₃",
        "把 bǎ with V₁V₂V₃",
        "Confrontation with 嗎 ma",
        "Existential Sentence with Posture Verbs",
        "為了 wèile in order to"
      ]
    },
    8: {
      title: "Learning Kungfu",
      objectives: [
        "Learning how to talk about my hobbies.",
        "Learning how to give and understand invitations.",
        "Learning how to accept or decline invitations.",
        "Learning how to express how I feel."
      ],
      grammar: [
        "見 jiàn as a Perceptual Result",
        "懂 dǒng as a Cognitive Result",
        "會 huì as an Achievement Result",
        "Potential Capability with -得 de- or -不 bu-",
        "Capability Complement 了 liǎo",
        "Vs + 得 de + complement so…that…",
        "To Keep on Doing Something with 下去 xiàqù",
        "Completion of an Action with V + 完 wán"
      ]
    },
    9: {
      title: "That City Is Really Beautiful",
      objectives: [
        "Learning to compare two different places.",
        "Learning to describe things I have seen in my travels.",
        "Learning to express my understanding of cultural differences.",
        "Learning to narrate unforgettable experiences or people."
      ],
      grammar: [
        "All set and ready with Verb complement 好 hǎo",
        "To be successful in …with Verb complement 到 dào",
        "Comparison with 比起來 bǐ qǐlái",
        "像 xiàng…一樣 yí yàng… is just like…",
        "Adverbial Complements 極了 jí le, 得不得了 de bùdéliǎo, 得很 de hěn terribly, extremely",
        "Verb complement 起 qǐ to be able to afford"
      ]
    },
    10: {
      title: "Come to My Place to Make Dumplings",
      objectives: [
        "Learning to explain how to make a dish.",
        "Learning to talk about ingredients.",
        "Learning to introduce the cuisines found in my country.",
        "Learning to express surprise."
      ],
      grammar: [
        "To figure out with the Complement 出來 chūlái",
        "Enough space to accommodate with Verb Complement 下 xià",
        "Disposal Construction 把 bǎ with Verb Reduplication 把 bǎ…V(一)V",
        "Disposal Construction 把 bǎ with Resultative Complements",
        "趁 chèn seize the moment"
      ]
    },
    11: {
      title: "Taiwan Really Has Lots of Fun Places",
      objectives: [
        "Learning to talk about travel plans.",
        "Learning to talk about scenic spots, their locations, and surroundings.",
        "Learning to describe the scenery and what is special about it.",
        "Learning to express satisfaction and disappointment."
      ],
      grammar: [
        "The Others 其他的 qítā de vs. Other 別的 biéde vs. Another 另外的 lìngwài de",
        "Verb Classifiers 下 xià, 趟 tàng, 遍 biàn, and 次 cì",
        "Expressing next in sequence with 然後 ránhòu, 後來 hòulái, and 以後 yǐhòu",
        "才 cái then and only then",
        "Passive Sentences with 被 bèi",
        "Verb Reduplication in V 了 le V",
        "Verb Particle (Complement) 上 shàng coming into contact"
      ]
    },
    12: {
      title: "How to Have a Healthy Diet?",
      objectives: [
        "Learning to talk about my eating habits and the eating customs in my country.",
        "Learning to talk about the good and bad aspects of an event or situation.",
        "Learning to give suggestions on healthy eating.",
        "Learning to talk about the different flavors of food and how to make food."
      ],
      grammar: [
        "讓 ràng to let someone do something",
        "快一點 kuài yīdiǎn hurry up",
        "Verb Particle 起 qǐ to touch upon",
        "只要 zhǐyào…就 jiù… as long as…",
        "越 yuè…越 yuè… the more…, the more…",
        "Topic as Contrastive"
      ]
    },
    13: {
      title: "I Lost My Cell Phone",
      objectives: [
        "Learning to express and respond to dissuasion.",
        "Learning to express the frequency of events.",
        "Learning to offer solutions for problems.",
        "Learning to make imperative and command statements."
      ],
      grammar: [
        "Completion of Action with V + 過 guò",
        "Verb Particle 走 zǒu away",
        "Imperative Sentences with 叫 jiào",
        "別再 bié zài…了 le stop doing it",
        "To offer assurance with 會 huì…的 de",
        "透過 tòuguò… by means of…",
        "才 cái…就 jiù… only just…, and…already",
        "Frequency with 每 měi + Time Expression",
        "只有 zhǐyǒu…，才 cái… cannot…, unless…"
      ]
    },
    14: {
      title: "I Am Going to Start Looking for a Job",
      objectives: [
        "Learning to talk about my studies and lifestyle.",
        "Learning to talk about my future and my plans for the future.",
        "Learning to talk about my career plans and expectations.",
        "Learning to talk about my friends' educational background and plans for the future."
      ],
      grammar: [
        "就要 jiù yào…了 le will soon…",
        "說到 shuōdào / 談到 tándào… talking of…",
        "對 duì A 有 yǒu B to be B in A",
        "連 lián…都 dōu… even",
        "不但 búdàn…，而且 érqiě… not only…but also…",
        "Unintentional 把 bǎ construction"
      ]
    },
    15: {
      title: "Lunar New Year",
      objectives: [
        "Learning to express welcome and carry on conversations with visiting guests.",
        "Learning to explain Lunar New Year traditions.",
        "Learning to say and understand Lunar New Year's greetings.",
        "Learning to use compliments to express the beginning or result of an action."
      ],
      grammar: [
        "Post-verbal Preposition 到 dào upto, till",
        "Manner 一 M 一 M one at a time",
        "Intensifying a State with 一 M 一 M more and more X; more X than the last…",
        "Inchoative Meaning with 起來 qǐlái",
        "Four-Character Phrases 四字格 sìzìgé"
      ]
    }
  }
};
