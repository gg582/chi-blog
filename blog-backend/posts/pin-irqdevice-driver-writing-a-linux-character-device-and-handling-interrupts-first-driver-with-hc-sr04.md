---
author: Lee Yunjin
---

# [Pin IRQ][Device Driver] Writing a Linux Character Device and Handling Interrupts: First Driver with HC-SR04

# Linux Character Device

A character device, as the name suggests, means interacting with the system in a **character-based** manner.
Devices managed by the same device driver share the same major number, while each individual device has its own unique minor number.

## Key Characteristics

- Stream-based sequential I/O
- Direct interaction between user space and device without buffering

## Allocation Order

- Assign major and minor numbers
- Allocate character device region
- Initialize character device structure
- Create character device class
- Create character device

## Main Use Cases

The property of communicating sequentially without buffering makes it suitable for serial ports.
Through such serial ports, you can interact with terminals, keyboards/mice, line printers, and more.

Let’s actually implement a character device with a simple interrupt and learn as we go.

## Basic Structure

A character device is typically represented by an init, exit, and two main memory I/O flows:
from user space → kernel memory, and from kernel memory → user space.
If necessary, you can define IOCTL (**I/O C**on**T**ro**L**) commands to specify I/O control operations.
This is used quite frequently, and will be covered later.

----

## Basic Headers / Hardware Connection

### Code
```c
#include<linux/init.h>
#include<linux/delay.h>
#include<linux/workqueue.h>
#include<linux/module.h>
#include<linux/wait.h>
#include<linux/cdev.h>
#include<linux/device.h>
#include<linux/err.h>
#include<linux/interrupt.h>
#include<linux/time.h>
#include<linux/gpio.h>
#define ECHO 536 // gpio-536 (GPIO-24) in /sys/kernel/debug/info
#define ECHO_LABEL "GPIO_24"
#define TRIG 535 // GPIO 23 // gpio-535 (GPIO-23) in /sys/kernel/debug/info
#define TRIG_LABEL "GPIO_23"
static wait_queue_head_t waitqueue; //waitqueue for wait and wakeup

dev_t dev = 0; // device driver's major/minor number

int IRQ_NO; //variable for storing echo pin irq
_Bool echo_status; //for checking ECHO pin status, needed for identifying RISING/FALLING
uint64_t sr04_send_ts, sr04_recv_ts, duration;
```

### Header Explanation

```c
#include<linux/init.h>
```
Required for the module's init and exit.

```c
#include<linux/workqueue.h>
#include<linux/wait.h>
```
Essential for using work queues.

```c
#include<linux/module.h>
```
Contains essential kernel module functionality.

```c
#include<linux/cdev.h>
#include<linux/device.h>
```
Required for using character device structures and classes.

```c
#include<linux/err.h>
```
Contains definitions for error handling, such as `IS_ERR`.

```c
#include<linux/interrupt.h>
#include<linux/time.h>
```
Includes definitions for retrieving timestamps.

```c
#include<linux/gpio.h>
```
Header for using GPIO.

```c
#define ECHO 536 // gpio-536 (GPIO-24) in /sys/kernel/debug/info
#define ECHO_LABEL "GPIO_24"
#define TRIG 535 // GPIO 23 // gpio-535 (GPIO-23) in /sys/kernel/debug/info
#define TRIG_LABEL "GPIO_23"
```
These will be explained below.

```c
static wait_queue_head_t waitqueue; //waitqueue for wait and wakeup
```
The wait queue, to be initialized in init.

```c
dev_t dev = 0; // device driver's major/minor number
```
Stores the major and minor numbers as a single integer (not a struct).

```c
int IRQ_NO; //variable for storing echo pin irq
```
Stores the IRQ number for the ECHO pin.

```c
_Bool echo_status; //for checking ECHO pin status, needed for identifying RISING/FALLING
uint64_t sr04_send_ts, sr04_recv_ts, duration;
```
Stores the ECHO pin state, the timestamps for start/end of pin interrupts, and their difference.

----

## Hardware Connection

<img src="https://hobbies.yoonjin2.kr:8080/assets/rpi_sr04.png" style="max-width:50%; height: auto;"/>

Prepare a Raspberry Pi and connect as follows:
TRIG pin to 23, ECHO pin to 24.

Note: Directly using GPIO pin numbers is not supported in Linux kernel 6.x.
Check pin mapping via:
```bash
cat /sys/kernel/debug/info
```
On my RPi 4B, ECHO is gpio-536, TRIG is gpio-535.

When requesting GPIO pins in the system, a label is also needed.
For simplicity, we’ll use the GPIO pin number in the label.

```c
#define ECHO 536 // gpio-536 (GPIO-25) in /sys/kernel/debug/info
#define ECHO_LABEL "GPIO_24"
#define TRIG 535 // GPIO 23 // gpio-535 (GPIO-23) in /sys/kernel/debug/info 
#define TRIG_LABEL "GPIO_23"
```

These macros are now defined for pin allocation.

## Interrupt Setup

<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F9978C64B5F64D18135" style="max-width:50%; height: auto;"/>

To use a pin as an interrupt wake-up signal, you must specify whether it triggers on RISING, FALLING, etc.
It’s best to tell the kernel to use both rising and falling edges for reliable detection.

```c
IRQ_NO = gpio_to_irq(ECHO); // GPIO pin as interrupt pin
if(request_irq(IRQ_NO, echo_irq_triggered, IRQF_TRIGGER_RISING | IRQF_TRIGGER_FALLING, "hc-sr04", (void *) echo_irq_triggered)) {
    _printk("cannot register Irq...");
    free_irq(IRQ_NO, (void *) echo_irq_triggered);
}
```

## Distance Formula

Recall the basic formula:
```
Distance = Speed × Time
```
Since the time measured is for a round trip, and sound speed ≈ 340 m/s, in cm the formula becomes:
```
distance_cm = duration * 170 / 10000000
```

The duration is obtained in the interrupt handler.

----

## Pin Setup

ECHO is always input-only (interrupt trigger). TRIG is output-only.

```c
gpio_direction_output(TRIG,0);
gpio_direction_input(ECHO);
```

## Memory Allocation and Release

Free in reverse order of allocation. On failure at a step, use `goto` to jump to cleanup code.

Example:

```c
static int __init sr04_driver_init(void) {
    int major = MAJOR(dev);
    int minor = MINOR(dev);
    if(alloc_chrdev_region(&dev, minor, 1, "sr04")<0) {
        _printk("Cannot allocate chrdev region...");
        goto chrdev_error;
    }
    ...
chrdev_error:
    unregister_chrdev_region(dev,1);
    return -1;
...
}
```

On exit, free in reverse allocation order:

```c
static void __exit sr04_driver_exit(void) {
    free_irq(IRQ_NO, (void *) echo_irq_triggered);
    gpio_free(ECHO);
    gpio_free(TRIG);
    device_destroy(sr04_class,dev);
    class_destroy(sr04_class);
    cdev_del(&sr04_cdev);
    unregister_chrdev_region(dev,1);
    _printk( "SR04 Dev. Driver removed.
" );
}
```

----

## Interrupt Handling

Measure the timestamps on rising and falling edges, compute duration, and wake up the wait queue.

```c
static irqreturn_t echo_irq_triggered(int irq, void *dev_id) {
    echo_status = (_Bool)gpio_get_value(ECHO);
    if(echo_status == 1) {
        sr04_send_ts = ktime_get_ns();
        _printk("ECHO INTERRUPT
");
    } else {
        _printk("SUCCEED TO GET sr04_recv_ts%llu
", sr04_recv_ts);
        sr04_recv_ts = ktime_get_ns();
        duration = sr04_recv_ts-sr04_send_ts;
        wake_up_interruptible(&waitqueue);
    }
    return IRQ_HANDLED;
}
```

## Reading After Interrupt

```c
ssize_t sr04_read(struct file *file, char __user *buf, size_t len, loff_t * off) {
    gpio_set_value(TRIG,1);
    wait_event_interruptible(waitqueue,echo_status == 0);
    gpio_set_value(TRIG,0);
    if(duration<=0) {
        _printk("Distance measurement failed.");
        return 0;
    } else {
        char dist[16];
        memset(dist,0,sizeof(dist));
        sprintf(dist, "%llu", duration*170/10000000);
        int copied_bytes=copy_to_user(buf,dist,16);
        return sizeof(dist);
    }
}
```

----

## Full Source Code

```c
#include<linux/init.h>
#include<linux/workqueue.h>
#include<linux/module.h>
#include<linux/wait.h>
#include<linux/cdev.h>
#include<linux/device.h>
#include<linux/err.h>
#include<linux/interrupt.h>
#include<linux/time.h>
#include<linux/gpio.h>
#define ECHO 536 // gpio-536 (GPIO-24) in /sys/kernel/debug/info 
#define ECHO_LABEL "GPIO_24"
#define TRIG 535 // GPIO 23 // gpio-535 (GPIO-23) in /sys/kernel/debug/info 
#define TRIG_LABEL "GPIO_23"
static wait_queue_head_t waitqueue; //waitqueue for wait and wakeup

dev_t dev = 0; // device driver's major/minor number

int IRQ_NO; //variabe for storing echo pin irq
_Bool echo_status; //for checking ECHO pin status, needed for identifying RISING/FALLING
uint64_t sr04_send_ts, sr04_recv_ts, duration;
/* start of IRQ Handler */

static irqreturn_t echo_irq_triggered(int irq, void *dev_id) {
	echo_status = (_Bool)gpio_get_value(ECHO);
	if(echo_status == 1) {
		sr04_send_ts = ktime_get_ns();
		_printk("ECHO INTERRUPT\n");
	} else {
		_printk("SUCCEED TO GET sr04_recv_ts%llu\n", sr04_recv_ts);
		sr04_recv_ts = ktime_get_ns();
		duration = sr04_recv_ts-sr04_send_ts;
		wake_up_interruptible(&waitqueue); // interrupt wake up
	}
		
	return IRQ_HANDLED;
}


/* -- start of function prototype */
struct class *sr04_class;
struct cdev sr04_cdev;

static int __init sr04_driver_init(void);
int sr04_driver_open(struct inode *inode, struct file *file) ;
int sr04_driver_release(struct inode *inode, struct file *file) ;
static void __exit sr04_driver_exit(void);

ssize_t sr04_read(struct file *file, char __user *buf, size_t len, loff_t * off);

/* -- end of function prototype -- */

struct file_operations fops = {
	.owner	= THIS_MODULE,
	.read	= sr04_read,
	.open	= sr04_driver_open,
	.release = sr04_driver_release,
};

int sr04_driver_open(struct inode *inode, struct file *file) {
	return 0;
}
int sr04_driver_release(struct inode *inode, struct file *file) {
	return 0;
}

static int __init sr04_driver_init(void) {
    int major = MAJOR(dev);
    int minor = MINOR(dev);
	if(alloc_chrdev_region(&dev, minor, 1, "sr04")<0) { /* NOTE: DEV_T ALLOC */
		_printk("Cannot allocate chrdev region, \n find comment \"NOTE: DEV_T ALLOC \"\n, \
			Quitting without driver ins...\n");
		goto chrdev_error;
	}
	_printk("Major = %d, Minor = %d", MAJOR(dev),MINOR(dev));
	cdev_init(&sr04_cdev,&fops);
	if((cdev_add(&sr04_cdev,dev,1)) < 0) { /* NOTE: ADDING CDEV */
		_printk("Cannot add cdev: find comment \"NOTE: ADDING CDEV\"\n,\
			 Quitting without driver ins...\n");\
		goto cdev_error;
	}
	if(IS_ERR(sr04_class = class_create("sr04_class"))) { /*NOTE: CREATING DEV CLASS */
		_printk("Cannot create class structure,\n \
			  find comment \"NOTE: CREATING DEV CLASS\",\
			  Quitting without driver ins..\n");
		goto class_error;
	}

	if(IS_ERR(device_create(sr04_class, NULL, dev, NULL, "sr04"))) {
		_printk("Cannot create the device,\n find comment \"NOTE: DEV CREATION\", \nQuitting without driver ins...\n");
		goto device_creation_error;
	}


	//gpio availability check
	if(!gpio_is_valid(ECHO)) {
		_printk("SR04 ECHO PIN IS NOT WORKING\n");
	}
	if(!gpio_is_valid(TRIG)) {
		_printk("SR04 TRIG PIN IS NOT WORKING\n");
	}

	if(gpio_request(TRIG,TRIG_LABEL)<0) {
		_printk("ERROR ON TRIG REQUEST");
		gpio_free(TRIG);
		return -1;
	}
	if(gpio_request(ECHO,ECHO_LABEL)<0) {
		_printk("ERROR ON ECHO REQUEST");
		gpio_free(TRIG); //if the program has executed until now, trig is available, and requested succesfully
		gpio_free(ECHO);
		return -1;
	}

	IRQ_NO = gpio_to_irq(ECHO); // GPIO pin as interrupt pin
	if(request_irq(IRQ_NO, echo_irq_triggered, IRQF_TRIGGER_RISING | IRQF_TRIGGER_FALLING, "hc-sr04", (void *) echo_irq_triggered)) { //request irq function is for measurement... see the top of the code.
		_printk("cannot register Irq...");
		free_irq(IRQ_NO, (void *) echo_irq_triggered);
	}

	gpio_direction_output(TRIG,0);
	gpio_direction_input(ECHO);
	init_waitqueue_head(&waitqueue); // waitqueue init
	_printk("SR04 Dev. Driver inserted.");
	return 0;


chrdev_error:
	unregister_chrdev_region(dev,1);
	_printk("SR04 Dev. Driver failed");
	return -1;
cdev_error:
	cdev_del(&sr04_cdev);
	goto chrdev_error;
class_error:
	class_destroy(sr04_class);
	goto cdev_error;

device_creation_error:
	device_destroy(sr04_class,dev);
	goto class_error;
}

static void __exit sr04_driver_exit(void) {
	free_irq(IRQ_NO, (void *) echo_irq_triggered);
	gpio_free(ECHO);
	gpio_free(TRIG);
	device_destroy(sr04_class,dev);
	class_destroy(sr04_class);
	cdev_del(&sr04_cdev);
	unregister_chrdev_region(dev,1);
	_printk( "SR04 Dev. Driver removed.\n" );
}


ssize_t sr04_read(struct file *file, char __user *buf, size_t len, loff_t * off) {
	gpio_set_value(TRIG,1);
	wait_event_interruptible(waitqueue,echo_status == 0); //wait for interrupt pin
	gpio_set_value(TRIG,0);
	if(duration<=0) { //if duration is invalid
		_printk("SR04 Distance measurement: failed to get ECHO.. : duration is %llu\n", duration);
		return 0;
	} else {
		char dist[16];
		memset(dist,0,sizeof(dist));
		sprintf(dist, "%llu", duration*170/10000000);
		_printk("duration : %llu\n", duration);
		int copied_bytes=copy_to_user(buf,dist,16);  //returning value as character
		if(copied_bytes>0) {
			_printk("Distance hasn't copied to user...remained bytes: %d", copied_bytes);
		}
		return sizeof(dist);
	}
	return 0;
}


module_init(sr04_driver_init);
module_exit(sr04_driver_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Yunjin Lee <gzblues61@daum.net>");
MODULE_DESCRIPTION("HC-SR04");
MODULE_VERSION("0.01");
```

## Conclusion

In this session, we covered the basics of character devices and interrupts.
We also could see the benefits of Procedure Oriented Programming via Hardware interaction.
