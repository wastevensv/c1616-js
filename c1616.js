// States
C1616_STATE_READY = 0;
C1616_STATE_STOP  = 1;
C1616_STATE_HALT  = 2;

// Helpers
function signed(i)
{
  if ( i > 32767)
    return i - (32768*2);
  else
    return i;
}

// Create the hardware!
function C1616()
{
  this.printinst = function(i) {
    inst = this.mem[i];
    op = inst >> 8;
    op &= 0xff;
    imm = inst & 0xff;

    this.d = this.debug[op];
    return "" + i + ": " + this.d(imm);
  };

  this.dumpstate = function() {
    return "  REG = " + this.reg + "\n" +
           "  PC  = " + this.pc + "\n" +
           "  MEM = " + this.mem;
  };

  // Interrupts - trigger a specific external action, usually using the value in the register.
  this.irq = [];
  for (i = 0; i < 256; i++) { // Initialize default value of halting function.
    this.irq[i]= function(c){ c.state = C1616_STATE_HALT; };
  }

  // Instructions - operations that manipulate the memory and registers.
  this.instr = [];
  for (i = 0; i < 256; i++) { // Initialize default value of halting function.
    this.instr[i]= function(i){ this.state = C1616_STATE_HALT; };
  }

  this.instr[0] = function(i) { this.reg = this.mem[i]; };	// LOAD
  this.instr[1] = function(i) {					// SWAP
    v = this.reg;
    this.reg = this.mem[i];
    this.mem[i] = v;
  };
  this.instr[2] = function(i) { this.mem[i] = this.reg; };	// STORE
  this.instr[3] = function(i) { this.state = C1616_STATE_STOP; };	// STOP

  this.instr[4] = function(i) { if(this.mem[i] > this.reg) ++this.pc; };	// TSG
  this.instr[5] = function(i) { if(this.mem[i] < this.reg) ++this.pc; };	// TSL
  this.instr[6] = function(i) { if(this.mem[i] == this.reg) ++this.pc; };	// TSE
  this.instr[7] = function(i) { if(this.mem[i] != this.reg) ++this.pc; };	// TSI

  this.instr[8] = function(i) { this.pc = i - 1; };		// JMP
  this.instr[9] = function(i) { this.pc = this.mem[i] - 1; };	// JMA
  this.instr[10]= function(i) {
    this.fi = this.irq[i];
    this.fi();
  }; // INT
  this.instr[11]= function(i) { this.state = C1616_STATE_HALT; }; // Unused

  this.instr[12]= function(i) { this.in = this.reg; };		// IOW
  this.instr[13]= function(i) { this.reg = this.in; };		// IOR
  this.instr[14]= function(i) {					// IOS
    var tmp = this.reg
    this.reg = this.in;
    this.in = tmp;
  };
  this.instr[15]= function(i) { this.in = 0; };		// IOC

  this.instr[16]= function(i) { this.reg += this.mem[i]; };	// ADD
  this.instr[17]= function(i) { this.reg -= this.mem[i]; };	// SUB
  this.instr[18]= function(i) {					// MUL
    r = signed( this.reg );
    m = signed( this.mem[i] );
    this.reg = r * m;
  };
  this.instr[19]= function(i) {					// DIV
    r = signed( this.reg );
    m = signed( this.mem[i] );
    this.reg = r / m;
  };

  this.instr[20]= function(i) { this.reg <<= i; };		// SHL
  this.instr[21]= function(i) { this.reg >>= i; };		// SHR
  this.instr[22]= function(i) {					// ROL
    v = ( (this.reg << 8) | this.reg );
    this.reg = v >> (8 - i);
  };
  this.instr[23]= function(i) {					// ROR
    v = ( (this.reg << 8) | this.reg );
    this.reg = v >> i;
  };

  this.instr[24]= function(i) { this.reg += this.mem[i]; };	// ADDU*
  this.instr[25]= function(i) { this.reg -= this.mem[i]; };	// SUBU*
  this.instr[26]= function(i) { this.reg *= this.mem[i]; };	// MULU
  this.instr[27]= function(i) { this.reg /= this.mem[i]; };	// DIVU

  this.instr[28]= function(i) { this.reg += 1; };		// INC
  this.instr[29]= function(i) { this.reg -= 1; };		// DEC
  this.instr[30]= function(i) { this.reg *= 2; };		// DOUBLE
  this.instr[31]= function(i) { this.reg /= 2; };		// HALF

  // Debugging names for instructions.
  this.debug = [];
  for (i = 0; i < 256; i++) { // Initialize default value of ILLEGAL OPCODE.
    this.debug[i]= function(i){ return "ILLEGAL OPCODE";};
  }

  this.debug[0]= function(i) { return "LOAD  " + i; };
  this.debug[1]= function(i) { return "SWAP  " + i; };
  this.debug[2]= function(i) { return "STOR  " + i; };
  this.debug[3]= function(i) { return "STOP"; };
  this.debug[4]= function(i) { return "TSG   " + i; };
  this.debug[5]= function(i) { return "TSL   " + i; };
  this.debug[6]= function(i) { return "TSE   " + i; };
  this.debug[7]= function(i) { return "TSI   " + i; };

  this.debug[8]= function(i) { return "JMP   " + i; };
  this.debug[9]= function(i) { return "JMA   " + i; };
  this.debug[10]=function(i) { return "INT   " + i; };
  this.debug[11]=function(i) { return "---"; };
  this.debug[12]=function(i) { return "IOW"; };
  this.debug[13]=function(i) { return "IOR"; };
  this.debug[14]=function(i) { return "IOS"; };
  this.debug[15]=function(i) { return "IOC"; };

  this.debug[16]=function(i) { return "ADD   " + signed(i); };
  this.debug[17]=function(i) { return "SUB   " + signed(i); };
  this.debug[18]=function(i) { return "MUL   " + signed(i); };
  this.debug[19]=function(i) { return "DIV   " + signed(i); };
  this.debug[20]=function(i) { return "SHL   " + i; };
  this.debug[21]=function(i) { return "SHR   " + i; };
  this.debug[22]=function(i) { return "ROL   " + i; };
  this.debug[23]=function(i) { return "ROR   " + i; };

  this.debug[24]=function(i) { return "ADDU  " + i; };
  this.debug[25]=function(i) { return "SUBU  " + i; };
  this.debug[26]=function(i) { return "MULU  " + i; };
  this.debug[27]=function(i) { return "DIVU  " + i; };
  this.debug[28]=function(i) { return "INC"; };
  this.debug[29]=function(i) { return "DEC"; };
  this.debug[30]=function(i) { return "DOUB"; };
  this.debug[31]=function(i) { return "HALF"; };

  this.debugmode = false;

  // Execute the next instruction
  this.step = function() {
    if (this.state != C1616_STATE_READY) return;

    if (this.debugmode) {
      console.log(this.printinst(this.pc));
    }

    inst = this.mem[this.pc];
    op = inst >> 8;
    op &= 0xff;
    imm = inst & 0xff;

    this.f = this.instr[op];
    this.f(imm);

    this.reg &= 0xffff;

    ++this.pc;
    this.pc &= 0xff;

    if (this.debugmode) {
      console.log(this.dumpstate());
    }
  };

  this.reset = function() {
    this.reg = 0;
    this.pc = 0;
    this.state = C1616_STATE_READY
  };

  this.clear = function() {
    this.mem = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.in = 0;
  };

  this.clear();
  this.reset();
};
