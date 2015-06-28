#C1616 computer Javascript emulator

This is an emulator for the C1616 computer. It is based on the C88 computer, which used 8 bit words and had 8 memory locations.

A minimalist CPU architecture with only 256 bits of memory.

The original 8 bit version is implemented in an FPGA using VHDL, it is available here: https://github.com/danieljabailey/C88

This is an emulator for a 16 bit version of that machine, implemented in Javascript.

##Usage

Just open up the c1616.html file and enter a program by clicking on the memory bits to toggle them.

Run the program with the run and step buttons at the bottom.

The reset button will set the PC and main register to zero.

##Library

c1616.js is a file containing the emulator without the GUI.
You can use this to make your own gui.

First get a c1616 object like this:

```javascript
	c = new c1616();
```

Then you can set the memory which is an array of sixteen integers:
```javascript
	c.mem=[224, 37, 6, 23, 64, 7, 1, 0];
```

Then run the program and update some kind of memory display:
```javascript
	setInterval(
		function(){
			c.step();
			myDisplay = c.mem;
		},1);
```
