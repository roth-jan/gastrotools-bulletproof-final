# 🍎 **MAC DEVTOOLS ANLEITUNG**

## **🔧 MAC SHORTCUTS (nicht F12):**

### **DEVTOOLS ÖFFNEN:**
```
⌘ + ⌥ + I     (Command + Option + I)
```

### **ODER:**
```
Right-click auf Seite → "Inspect Element"
```

### **ODER:**
```
Safari: Develop Menu → Show Web Inspector
Chrome: View Menu → Developer → Developer Tools
```

---

## **🔍 MODAL DEBUG STEPS:**

### **SCHRITT 1: DevTools öffnen**
```
1. ⌘ + ⌥ + I drücken
2. Elements Tab auswählen
```

### **SCHRITT 2: Modal diagnostic** 
```
1. Gehe zu /signup-light
2. Klick "Tools" button
3. Modal öffnet sich
4. In DevTools: Element-Picker (⌘ + ⇧ + C)
5. Klick auf Modal content area
```

### **SCHRITT 3: CSS Check**
```
1. In DevTools schau nach:
   - height: Wert
   - overflow: Wert  
   - max-height: Wert
2. Sage mir die Werte
```

---

## **⚡ ODER SIMPLE FIX:**

### **IN BROWSER CONSOLE:**
```
⌘ + ⌥ + J (Console öffnen)

Dann eingeben:
const modal = document.querySelector('.fixed .bg-white')
console.log('Modal height:', modal.style.height)
console.log('Modal scroll:', modal.scrollHeight, modal.clientHeight)
```

**Das gibt mir die exact info die ich brauche! 🍎🔍**