; Ministry of Education IVR Configuration
; File: extensions_ivr.conf

[ministry-ivr]
; Main IVR entry point
exten => s,1,NoOp(Ministry of Education IVR)
same => n,Answer()
same => n,Wait(1)
same => n,Set(TIMEOUT(digit)=5)
same => n,Set(TIMEOUT(response)=10)
same => n(menu),Background(custom/main-menu)
same => n,WaitExten(10)
same => n,Goto(menu)  ; Loop back if no input

; Option 1: Exam Inquiries
exten => 1,1,NoOp(Exam Inquiries Selected)
same => n,Playback(please-wait)
same => n,Queue(exam_queue,t,,,300)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()

; Option 2: Teacher Complaints
exten => 2,1,NoOp(Teacher Complaints Selected)
same => n,Playback(please-wait)
same => n,Queue(teacher_queue,t,,,300)
same => n,Voicemail(101@ministry,u)
same => n,Hangup()

; Option 3: Facilities
exten => 3,1,NoOp(Facilities Selected)
same => n,Playback(please-wait)
same => n,Queue(facilities_queue,t,,,300)
same => n,Voicemail(102@ministry,u)
same => n,Hangup()

; Option 4: Other Services
exten => 4,1,NoOp(Other Services Selected)
same => n,Playback(please-wait)
same => n,Queue(general_queue,t,,,300)
same => n,Voicemail(103@ministry,u)
same => n,Hangup()

; Option 0: Operator
exten => 0,1,NoOp(Operator Requested)
same => n,Playback(please-wait)
same => n,Dial(SIP/operator,30,t)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()

; Invalid option
exten => i,1,Playback(invalid)
same => n,Goto(s,menu)

; Timeout
exten => t,1,Playback(goodbye)
same => n,Hangup()

; Hang up
exten => #,1,Playback(goodbye)
same => n,Hangup()

[ministry-business-hours]
; Time-based routing
exten => s,1,NoOp(Time Check)
same => n,GotoIfTime(09:00-17:00,mon-fri,*,*?open,s,1)
same => n,Goto(closed,s,1)

[open]
exten => s,1,NoOp(Business Hours - Open)
same => n,Goto(ministry-ivr,s,1)

[closed]
exten => s,1,NoOp(After Hours - Closed)
same => n,Playback(custom/voicemail-prompt)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()
