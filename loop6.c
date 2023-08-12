// LOOP6.C by Glen E. Gardner Jr.  08/2014
// de AA8C   
// glen.gardner@verizon.net
// glen.gardner@gridtoys.com

// to compile: gcc -o loop6 loop6.c  -lm


#include<stdlib.h>
#include<stdio.h>
#include<math.h>
#include<strings.h>


//declare the needed functions
void data_in(void);
void radr(void);
void skin(void);
void proximity(void);
void efficiency(void);
void inductance(void);
void resonance(void);
void match(void);
void data_out(void);


// declare the variables

// operating frequency
double freq;

// dynamic resistance of the LC circuit
double DR;

// transmitter power
double PO;

// voltage on the capacitor at 100 watts
double VMAX;

// wavelength
double la;

// Q of the antenna
double Q;

// 2:1 SWR bandwidth of the antenna
double SWR;

// 6 dB bandwidth of the antenna
double bw;

// estimated efficiency
double eff;

// resistivity of 6061-T6 aluminum alloy
double o;

// reciprocal of the resistivity
// conductivity
double oo;

// resistivity of skin effect
double Rs;

// rf loss resistance for skin effect
double Rhf;

// combined rf loss resistance for 
// skin effect and proximity effect
double Rhf2;

// permeability of free space
double u;

// relative permeability of aluminum
double ur;

// diameter of the loop
double D;

// radius of the loop
double Ra;

// circumference of the loop
double CIR;

// area of the loop
double A;

// width of the loop
double W;

// height of the loop
double H;

// diameter of the loop conductor
double d;

// radius of the loop conductor
double ra;

// cross-sectional area of the loop conductor
double a;

// radius of the loop conductor
double r;

// circumference of the loop conductor
double cir;

// series input impedance
double Zin;

// rf resistance loss
double Rrf;

// inductance of a loop
double L;

// conductor inductance
double Lc;

// inductive reactance of a loop
double Xl;

// Capacitance 
double C;

// capacative reactance
double Xc;

// radiation resistance
double Rr;

// loop series impedance
double Z;

// area of pickup loop
double area;

// number of loops
double N;

// coefficient of coupling
double K;


// low frequency limit
double low;

// high frequency limit
double high;

// frequency step
double step;

char type[256];

int main(void)
{
double la2;
int i;



// get the needed input
data_in();


//A=0.660644;
// resistivity of aluminum
//o=0.000000037;
// resistivity of copper
//o=0.0000000168;

// conductivity
oo=1/o;

//free space permeability
u=4*M_PI*pow(10,-7);

// the relative permeability of aluminum
//ur=1.000022;
// the relative permeability of copper
// ur=0.999994;

//CIR=3.2512;
//d=0.0111125;
r=d/2;
cir=M_PI*d;


//K=0.427139;
//Ra=D/2;




freq=low;
while(freq < high)
{

la=300000000/freq;
la2=la/2;

if(!strcasecmp(type,"SQUARE")){D=CIR/4;Ra=D/2;A=D*D;}
if(!strcasecmp(type,"CIRCLE")){D=CIR/M_PI;Ra=D/2;A=M_PI*Ra*Ra;}

// calculate the radiation resistance
 radr();

// add skin effect to Rrf
skin();

// if more than one loop is present, estimate the proximity effect
if(N>1)proximity();

// calculate the efficiency of the loop
efficiency();

// calculate the inductance of the loop
inductance();

// calculate the reactance of the loop
// as well as series input impedance
resonance();

// calculate the area  of the small coupling loop
match();

// print out much preformatted data
data_out();

freq=freq+step;
}

}


void data_in(void)
{

printf("LOOP TYPE (CIRCLE or SQUARE): ");
scanf("%s",&type);
//printf("type %s\n",type);
printf("LOOP CIRCUMFERENCE(METERS): ");
scanf("%lf",&CIR);

printf("CONDUCTOR DIAMETER(METERS): ");
scanf("%lf",&d);

printf("NUMBER OF LOOP CONDUCTORS: ");
scanf("%lf",&N);

printf("RESISTIVITY OF LOOP MATERIAL (OHM-METER): ");
scanf("%lf",&o);

printf("RELATIVE PERMEABILITY OF LOOP MATERIAL: ");
scanf("%lf",&ur);

K=1;

if(N>1)
{
printf("LOOP COEFFICIENT OF COUPLING (K>=1/N,K<=1): ");
scanf("%lf",&K);

}

printf("TRANSMITTER POWER (WATTS): ");
scanf("%lf",&PO);

printf("LOW FREQUENCY LIMIT (MHz): ");
scanf("%lf",&low);
low=low*1000000;

printf("HIGH FREQUENCY LIMIT (MHz): ");
scanf("%lf",&high);
high=high*1000000;

printf("FREQUENCY STEP (MHz): ");
scanf("%lf",&step);
step=step*1000000;

}


void radr(void)
{
// radiation resistance for a single loop
// This is the favored model for radiation resistance in a loop
// It is problematic in that it is an approximation, and it is not 
// correct in the case of a square loop.
 
Rr=31171*((A*A)/(la*la*la*la));

// It turns out that the radiation resistance for a round loop
// is very close to 1.621 times greater than that of a square loop.
//
// correction for a square loop
if(!strcasecmp(type,"SQUARE"))Rr=Rr/1.621;

// radiation resistance increases directly with the 
// the number of parallel loops
// so we need to adjust it.
Rr=Rr*N;
}

void skin(void)
{

//double i;

// This is the standard model for skin effect
//
Rs=sqrt((M_PI*freq*u*ur)/oo);

Rhf=(CIR/cir)*Rs;

// the rf resistance loss decreases as
// the number of loops increase.
//
Rhf2=Rhf/N;

}

void proximity(void)
{
double Ro;
double Rp;
double Rpo;

Ro=Rhf/CIR;

// This parameter is estimated based on Glen Smith ,1971
// This ends up being a little contrived, but will work
// provided that the antenna is built with the spacing
// between conductors equal to or greater than that 
// recommended by Smith.
//

// Yes. Yet another approximation.
// Boldly assuming that the increase in proximity
// effect is close to N cubed!
Rpo=0.003*N*N*N;
//Rpo=1;

Rp=Ro*Rpo;

Rhf2=(Rp+Ro)*CIR;

}

void efficiency(void)
{
// ground effects are ignored in this case
eff=Rr/(Rr+Rhf2);
}

void inductance(void)
{

// This is for a circular loop
L=Ra*u*ur*(log((8*Ra)/r)-2);

// This is for a square loop
if(!strcasecmp(type,"SQUARE"))L=((2*u*ur*D)/M_PI)*(log(D/r)-0.77401);

// adjust for the coefficient of coupling in parallel conductor loops
if(N>1)L=L/(N*K);
}


void match(void)
{
double Zin=50.0;

area=A*(Z/sqrt(Zin));

}

void resonance(void)
{
Xl=2*M_PI*freq*L;
Z=sqrt(Rr+Rhf2);
Xc=Xl;
C=(1/Xc)/(2*M_PI*freq);
Q=Xl/(2*(Rr+ Rhf2));
bw=(freq/Q)/1000;
SWR=2*(bw/(3/0.512));
DR=Xl*Q;
VMAX=sqrt(PO*DR);
}

void data_out(void)
{
//freq=freq/1000000;
printf(" Frequency: %3.3f MHz  Rr: %4.4f ohm\n",freq/1000000,Rr+0.00004);
printf(" Rhf2: %4.4f ohm  Efficiency: %0.4f\n",Rhf2+0.00004,eff+0.00004);
L=L*1000000;
C=C*1000000000000;
printf(" L: %4.4f uH Xl: %4.4f ohm  C: %4.1f pF\n",L+0.00004,Xl+0.00004,C+0.04);
printf(" Z: %4.4f ohm Q: %4.4f\n",Z,Q);
printf(" Bandwidth: %6.4f KHz.  2:1 SWR Bandwidth: %6.4f KHz\n",bw+0.00004,SWR+0.00004);
printf(" Dynamic Resistance: %6.2f Ohm. Potential across the Capacitor: %6.2f Volt\n",DR+0.004,VMAX+0.004);
printf(" Pickup loop area: %4.4f square meters\n\n",area+0.00004);
}

