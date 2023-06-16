## Explanation of the filter criteria

### Model type

**Population model**
:   Models that do not describe the activity at the level of individual cells,
    but rather on the level of populations.

    Also known as: *Population density models, Ensemble models, mean field models*

**Single compartment (Simple) model**
:   Highly simplified models of individual neurons, that do not model the
    biological details (e.g. action potential generation). Typically, the neural
    activity is described with a single differential equation and an explicit
    threshold/reset mechanism.

    Examples: *binary neuron model, integrate-and-fire model, Izhikevich model*

**Single compartment (Complex) model**
:   Models of individual neurons, that model biological details such as ion
    channels and action potential generation. Neurons are modeled as "point
    neurons", i.e. no attempt to model their spatial morphology is made.

    Examples: *Hodgkin-Huxley model (point neuron), conductance-based model*

**Multi-Compartment model**
:   Models that take the spatial morphology into account, by representing each
    neuron as multiple interconnected "compartments". This makes it possible to
    study the spatial propagation and integration of signals along dendrites and
    axons.

### Computing power

**Single Machine**
:   A single desktop computer or laptop.

**Cluster**
:   A cluster of computers, typically connected via a high-speed network.

**Supercomputer**
:   A supercomputer, typically with a large number of CPUs and (possibly) GPUs.

**GPU**
:   A graphics card capable of performing general purpose computations.