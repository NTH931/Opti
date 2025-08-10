interface ThreadException extends Exception {}

interface InterruptedException extends ThreadException {}
interface TerminatedException extends ThreadException {}
interface OverflowException extends ThreadException {}