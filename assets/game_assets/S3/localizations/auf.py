import xml.etree.ElementTree as ET
from collections import Counter

# Загружаем XML из файла
tree = ET.parse("text.xml")
root = tree.getroot()
aaaa = 2266
for chapter in root.findall("chapter"):
    chapter_id = chapter.get("id")
    
    targets = [t.text.strip() for t in chapter.findall(".//targetChapter")]
    
    counts = Counter(targets)
    duplicates = [value for value, count in counts.items() if count > 1]
    
    if duplicates:
        print(f'<chapter id="{aaaa}"><choice id="1">Автопереход.<targetChapter>{' '.join(duplicates)}</targetChapter></choice></chapter>')
        #print(f" в главе {chapter_id} -> {' '.join(duplicates)}")
        aaaa+=1