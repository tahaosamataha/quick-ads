import re

with open('src/components/AutoSuite.tsx', 'r') as f:
    content = f.read()

# Replace the specific state block
new_state = """const [results, setResults] = useState<{
    spyData?: any;
    scripts?: any[];
    scriptAudios?: Record<number, any>;
    fbAds?: any;
    angles?: any;
    brainReport?: any;
    prompts?: any[];
    landingHtml?: string;
    funnelCopy?: any;
    videoScenes?: any;
    flowCharacter?: any;
    textOnVisual?: any;
    photoshootPrompts?: any[];
    geminiLandingData?: any;
    geminiAdsData?: any;
  } | null>(null);

  // Active Output Tab
  const [activeOutputTab, setActiveOutputTab] = useState<'spy' | 'scripts' | 'fbAds' | 'angles' | 'brain' | 'prompts' | 'landing' | 'funnel' | 'video' | 'flow' | 'textVisual' | 'photoshoot' | 'geminiLanding' | 'geminiAds'>('spy');"""

# Find the block and replace
content = re.sub(r"const \[results, setResults\] = useState<\{.*?\n  \} \| null>\(null\);\n\n  // Active Output Tab\n  const \[activeOutputTab, setActiveOutputTab\] = useState<.*?>\('spy'\);", new_state, content, flags=re.DOTALL)

with open('src/components/AutoSuite.tsx', 'w') as f:
    f.write(content)

